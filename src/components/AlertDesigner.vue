<template>
  <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="show">
    <v-dialog v-model="addOrUpdateActionDialog.showDialog" persistent max-width="600px">
      <v-card>
        <v-form
          ref="addOrUpdateActionForm"
          v-model="addOrUpdateActionDialog.formValid"
          @submit.prevent="addOrUpdateAction"
        >
          <v-card-title>
            <span class="headline">Create New Watch List</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="Target*"
                    :rules="addOrUpdateActionDialog.targetRules"
                    v-model="addOrUpdateActionDialog.newOrUpdatedAction.target"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    :items="addOrUpdateActionDialog.actionOnTypes"
                    label="Action On"
                    required
                    v-model="addOrUpdateActionDialog.newOrUpdatedAction.actionOn"
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    :items="addOrUpdateActionDialog.actionTypes"
                    label="Type"
                    required
                    v-model="addOrUpdateActionDialog.newOrUpdatedAction.type"
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="
                addOrUpdateActionDialog.showDialog = false;
                resetAddOrUpdateActionForm();
              "
            >
              Close
            </v-btn>
            <v-btn color="blue darken-1" text type="submit" :disabled="!addOrUpdateActionDialog.formValid"> Add </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-card v-if="!loading">
      <v-form ref="upsertAlertForm" v-model="formValid" @submit.prevent="saveAlert">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Alert Designer</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="closeDialog()"> Cancel </v-btn>
            <v-btn dark text type="submit"> Save </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>General</v-subheader>
          <v-list-item>
            <v-list-item-content>
              <v-row>
                <v-col cols="6" sm="3">
                  <v-text-field label="Name" :rules="nameRules" v-model="alertToModify.name" required></v-text-field>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-textarea label="Description" rows="3" v-model="alertToModify.description"></v-textarea>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-list two-line subheader>
          <v-subheader
            >Conditions
            <v-btn icon>
              <v-icon color="grey lighten-1">mdi-plus</v-icon>
            </v-btn>
          </v-subheader>

          <div v-if="alertToModify.conditions.length > 0">
            <template v-for="(condition, index) in alertToModify.conditions">
              <v-list-item :key="`${condition.wowItemId}${condition.connectedRealmId}`">
                <v-list-item-content>
                  <span v-html="getConditionString(condition)" />
                </v-list-item-content>

                <v-list-item-action>
                  <v-row>
                    <v-btn icon>
                      <v-icon color="grey lighten-1">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn icon>
                      <v-icon color="grey lighten-1" @click="removeCondition(condition)">mdi-delete</v-icon>
                    </v-btn>
                  </v-row>
                </v-list-item-action>
              </v-list-item>

              <v-divider v-if="index < alertToModify.conditions.length - 1" :key="index"></v-divider>
            </template>
          </div>

          <div v-else>
            <v-list-item>
              <v-list-item-content> There are no conditions. </v-list-item-content>
            </v-list-item>
          </div>
        </v-list>

        <v-divider />

        <v-list subheader two-line>
          <v-subheader
            >Actions
            <v-btn icon>
              <v-icon color="grey lighten-1" @click="openAddOrUpdateDialog()">mdi-plus</v-icon>
            </v-btn>
          </v-subheader>

          <div v-if="alertToModify.actions.length > 0">
            <template v-for="(action, index) in alertToModify.actions">
              <v-list-item :key="`${action.actionOn}${action.target}${action.type}`">
                <v-list-item-content>
                  {{ getActionText(action) }}
                </v-list-item-content>

                <v-list-item-action>
                  <v-row>
                    <v-btn icon>
                      <v-icon color="grey lighten-1" @click="openAddOrUpdateDialog(index)">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn icon>
                      <v-icon color="grey lighten-1" @click="removeAction(action)">mdi-delete</v-icon>
                    </v-btn>
                  </v-row>
                </v-list-item-action>
              </v-list-item>

              <v-divider v-if="index < alertToModify.actions.length - 1" :key="index"></v-divider>
            </template>
          </div>

          <div v-else>
            <v-list-item>
              <v-list-item-content> There are no actions. </v-list-item-content>
            </v-list-item>
          </div>
        </v-list>
      </v-form>
    </v-card>

    <div v-else>
      <v-skeleton-loader v-for="n in 3" :key="n" type="card" v-bind:class="n != 3 ? 'mb-6' : ''" elevation="2" />
    </div>
  </v-dialog>
</template>

<script lang="ts">
import {
  Alert,
  AlertAction,
  AlertActionOnType,
  AlertActionType,
  AlertCondition,
  AlertConditionMetric,
  ConnectedRealm,
  CreateAlertActionRequest,
  CreateAlertConditionRequest,
  CreateAlertForUserRequest,
  Realm,
  WoWItem
} from '@/models';
import Vue, { PropType } from 'vue';
import { cloneDeep } from 'lodash';
import { ArrayUtilities, Utilities } from '@/utilities';
import { realmService, wowItemService } from '@/services';

export default Vue.extend({
  name: 'AlertDesigner',

  props: {
    value: Boolean,
    wowItemId: {
      type: Number,
      required: false
    },
    connectedRealmId: {
      type: Number,
      required: false
    },
    alert: {
      type: Object as PropType<Alert>,
      required: false
    }
  },

  data: () => ({
    formValid: false,
    loading: false,
    nameRules: [(name: string) => !!name || 'Name is required'],
    items: new Map<number, WoWItem>(),
    realms: [] as Realm[],
    realmsLookup: new Map<number, Realm>(),
    connectedRealms: new Map<number, ConnectedRealm>(),
    addOrUpdateActionDialog: {
      targetRules: [(target: string) => !!target || 'Target is required'],
      showDialog: false,
      formValid: false,
      actionOnTypes: Object.values(AlertActionOnType).map(value => ({
        text: Utilities.splitAtUpperCase(value),
        value
      })),
      actionTypes: Object.values(AlertActionType).map(value => ({
        text: Utilities.splitAtUpperCase(value),
        value
      })),
      currentIndex: null as number | null,
      newOrUpdatedAction: {} as CreateAlertActionRequest
    },
    alertToModify: {
      name: '',
      description: '',
      conditions: [],
      actions: []
    } as CreateAlertForUserRequest
  }),

  methods: {
    getActionText(action: AlertAction | CreateAlertActionRequest): string {
      return `When alert ${
        action.actionOn === AlertActionOnType.AlertActivated ? 'activates' : 'deactivates'
      }, send ${action.type.toLowerCase()} to ${action.target}.`;
    },

    removeCondition(condition: CreateAlertConditionRequest): void {
      ArrayUtilities.removeItem(this.alertToModify.conditions, condition);
    },

    removeAction(action: CreateAlertActionRequest): void {
      ArrayUtilities.removeItem(this.alertToModify.actions, action);
    },

    addOrUpdateAction(): void {
      if (!this.addOrUpdateActionDialog.formValid || !this.addOrUpdateActionDialog.newOrUpdatedAction) {
        return;
      }

      if (typeof this.addOrUpdateActionDialog.currentIndex === 'number') {
        this.alertToModify.actions[this.addOrUpdateActionDialog.currentIndex] =
          this.addOrUpdateActionDialog.newOrUpdatedAction;
      } else {
        this.alertToModify.actions.push(this.addOrUpdateActionDialog.newOrUpdatedAction);
      }
    },

    openAddOrUpdateDialog(index?: number): void {
      if (typeof index === 'number') {
        this.addOrUpdateActionDialog.currentIndex = index;
        this.addOrUpdateActionDialog.newOrUpdatedAction = { ...this.alertToModify.actions[index] };
      } else {
        this.addOrUpdateActionDialog.newOrUpdatedAction = {
          type: AlertActionType.Email,
          actionOn: AlertActionOnType.AlertActivated,
          target: ''
        };
      }

      this.addOrUpdateActionDialog.showDialog = true;
    },

    getConditionString(condition: AlertCondition | CreateAlertConditionRequest): string {
      const item = this.items.get(condition.wowItemId);
      const realms = this.connectedRealms.get(condition.connectedRealmId)?.realms ?? [];
      const { g, s, c } = Utilities.convertToGoldSilverCopper(condition.threshold);

      return `When ${Utilities.splitAtUpperCase(
        condition.aggregationType
      ).toLowerCase()} of ${Utilities.splitAtUpperCase(
        condition.metric
      ).toLowerCase()} for <a href="https://www.wowhead.com/item=${item?.id}" target="_blank">${
        item?.name
      }</a> for ${realms.reduce(
        (prevStr, currRealm, j) =>
          `${prevStr}${currRealm.name}${
            j !== realms.length - 1
              ? `${j === realms.length - 2 ? `${realms.length > 2 ? ', and ' : ' and '}` : ', '}`
              : ''
          }`,
        ''
      )} is ${Utilities.splitAtUpperCase(condition.operator).toLowerCase()} ${
        condition.metric === AlertConditionMetric.TotalAvailableForAuction
          ? condition.threshold.toLocaleString('en-US')
          : `${g.toLocaleString('en-US')}g ${s}s ${c}c`
      } over period of ${condition.aggregationTimeGranularityInHours} hour${
        condition.aggregationTimeGranularityInHours === 1 ? '' : 's'
      }.`;
    },

    saveAlert(): void {
      console.log('Alert saved!');
      this.closeDialog();
    },

    closeDialog(): void {
      this.resetUpsertAlertForm();
      this.show = false;
    },

    resetUpsertAlertForm(): void {
      (this.$refs.upsertAlertForm as any).reset();
    },

    resetAddOrUpdateActionForm(): void {
      (this.$refs.addOrUpdateActionForm as any).reset();
    },

    async loadItems(): Promise<void> {
      if (this.alert) {
        const items = await Promise.all(
          [...new Set(this.alert.conditions.map(condition => condition.wowItemId))].map(itemId =>
            wowItemService.getItem(itemId)
          )
        );

        for (const item of items) {
          if (item) {
            this.items.set(item.id, item);
          }
        }
      }
    }
  },

  async mounted(): Promise<void> {
    this.loading = true;

    try {
      const connectedRealms = await realmService.getConnectedRealms();

      for (const connectedRealm of connectedRealms) {
        this.connectedRealms.set(connectedRealm.id, connectedRealm);

        for (const realm of connectedRealm.realms) {
          this.realmsLookup.set(realm.id, realm);
          this.realms.push(realm);
        }
      }

      ArrayUtilities.orderBy(this.realms, realm => realm.name);

      await this.loadItems();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  },

  watch: {
    async alert(): Promise<void> {
      this.loading = true;

      try {
        this.alertToModify = cloneDeep(this.alert) ?? {
          name: '',
          description: '',
          conditions: [],
          actions: []
        };

        if (this.alert) {
          const items = await Promise.all(
            [...new Set(this.alert.conditions.map(condition => condition.wowItemId))].map(itemId =>
              wowItemService.getItem(itemId)
            )
          );

          for (const item of items) {
            if (item) {
              this.items.set(item.id, item);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  },

  computed: {
    show: {
      get(): boolean {
        return this.value;
      },

      set(value: boolean): void {
        this.$emit('input', value);
      }
    }
  }
});
</script>
