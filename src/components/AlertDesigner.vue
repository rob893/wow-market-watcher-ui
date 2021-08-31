<template>
  <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="show">
    <v-card>
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

        <v-list three-line subheader>
          <v-subheader>Conditions</v-subheader>
          <v-list-item
            v-for="condition in alertToModify.conditions"
            :key="`${condition.wowItemId}${condition.connectedRealmId}`"
          >
            <v-list-item-content>
              <span v-html="getConditionString(condition)" />
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider />

        <v-list three-line subheader>
          <v-subheader>Actions</v-subheader>
          <v-list-item
            v-for="action in alertToModify.actions"
            :key="`${action.actionOn}${action.target}${action.type}`"
          >
            <v-list-item-content>
              {{ getActionText(action) }}
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Alert,
  AlertAction,
  AlertActionOnType,
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
    nameRules: [(name: string) => !!name || 'Name is required'],
    items: new Map<number, WoWItem>(),
    realms: [] as Realm[],
    realmsLookup: new Map<number, Realm>(),
    connectedRealms: new Map<number, ConnectedRealm>(),
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
    }
  },

  async mounted(): Promise<void> {
    const connectedRealms = await realmService.getConnectedRealms();

    for (const connectedRealm of connectedRealms) {
      this.connectedRealms.set(connectedRealm.id, connectedRealm);

      for (const realm of connectedRealm.realms) {
        this.realmsLookup.set(realm.id, realm);
        this.realms.push(realm);
      }
    }

    ArrayUtilities.orderBy(this.realms, realm => realm.name);
  },

  watch: {
    async alert(): Promise<void> {
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
