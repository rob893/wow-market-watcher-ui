<template>
  <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="show">
    <v-dialog v-model="addOrUpdateConditionDialog.showDialog" persistent max-width="600px">
      <v-card>
        <v-form
          ref="addOrUpdateConditionForm"
          v-model="addOrUpdateConditionDialog.formValid"
          @submit.prevent="addOrUpdateCondition"
        >
          <v-card-title>
            <span class="headline">
              {{ typeof addOrUpdateConditionDialog.currentIndex === 'number' ? 'Update' : 'Add' }} Alert Condition</span
            >
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="addOrUpdateConditionDialog.newOrUpdatedCondition.wowItem"
                    :items="items"
                    :loading="itemsLoading"
                    :search-input.sync="itemsSearchTerm"
                    cache-items
                    item-text="name"
                    item-value="id"
                    class="mx-4"
                    hide-no-data
                    hide-details
                    label="Item*"
                    requried
                    :rules="[v => !!v || 'Please select an item.']"
                  >
                    <template v-slot:item="{ parent, item }">
                      <v-list-item-content>
                        <v-list-item-title
                          v-html="
                            `${genFilteredColoredText(item.name, getItemQualityColor(item.quality, item.id), parent)}`
                          "
                        ></v-list-item-title>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="addOrUpdateConditionDialog.newOrUpdatedCondition.realm"
                    :items="realms"
                    item-text="name"
                    item-value="id"
                    class="mx-4"
                    hide-no-data
                    hide-details
                    label="Realm*"
                    :rules="[v => !!v || 'Please select an item.']"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    :items="addOrUpdateConditionDialog.aggregations"
                    label="Aggregation"
                    required
                    v-model="addOrUpdateConditionDialog.newOrUpdatedCondition.aggregationType"
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    :items="addOrUpdateConditionDialog.metrics"
                    label="Metric"
                    required
                    v-model="addOrUpdateConditionDialog.newOrUpdatedCondition.metric"
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-select
                    :items="addOrUpdateConditionDialog.operators"
                    label="Operator"
                    required
                    v-model="addOrUpdateConditionDialog.newOrUpdatedCondition.operator"
                  ></v-select>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    type="number"
                    :rules="addOrUpdateConditionDialog.thresholdRules"
                    label="Threshold"
                    required
                    v-model="addOrUpdateConditionDialog.newOrUpdatedCondition.threshold"
                  ></v-text-field>
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
                addOrUpdateConditionDialog.showDialog = false;
                resetAddOrUpdateConditionForm();
              "
            >
              Close
            </v-btn>
            <v-btn color="blue darken-1" text type="submit" :disabled="!addOrUpdateConditionDialog.formValid">
              {{ typeof addOrUpdateConditionDialog.currentIndex === 'number' ? 'Update' : 'Add' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addOrUpdateActionDialog.showDialog" persistent max-width="600px">
      <v-card>
        <v-form
          ref="addOrUpdateActionForm"
          v-model="addOrUpdateActionDialog.formValid"
          @submit.prevent="addOrUpdateAction"
        >
          <v-card-title>
            <span class="headline">
              {{ typeof addOrUpdateActionDialog.currentIndex === 'number' ? 'Update' : 'Add' }} Alert Action</span
            >
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
            <v-btn color="blue darken-1" text type="submit" :disabled="!addOrUpdateActionDialog.formValid">
              {{ typeof addOrUpdateActionDialog.currentIndex === 'number' ? 'Update' : 'Add' }}
            </v-btn>
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
              <v-icon color="grey lighten-1" @click="openAddOrUpdateConditionDialog()">mdi-plus</v-icon>
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
                      <v-icon color="grey lighten-1" @click="openAddOrUpdateConditionDialog(index)">mdi-pencil</v-icon>
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
              <v-icon color="grey lighten-1" @click="openAddOrUpdateActionDialog()">mdi-plus</v-icon>
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
                      <v-icon color="grey lighten-1" @click="openAddOrUpdateActionDialog(index)">mdi-pencil</v-icon>
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
  AlertConditionAggregationType,
  AlertConditionMetric,
  AlertConditionOperator,
  ConnectedRealm,
  CreateAlertActionRequest,
  CreateAlertConditionRequest,
  CreateAlertForUserRequest,
  Realm,
  WoWItem
} from '@/models';
import Vue, { PropType } from 'vue';
import { cloneDeep, debounce } from 'lodash';
import { ArrayUtilities, ColorUtilities, Utilities } from '@/utilities';
import { realmService, uiSettingsService, wowItemService } from '@/services';
import { WoWItemQualityColor } from '@/models/blizzard';

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
    itemsLookup: new Map<number, WoWItem>(),
    itemsLoading: false,
    items: [] as WoWItem[],
    itemsSearchTerm: null as string | null,
    realms: [] as Realm[],
    realmsLookup: new Map<number, Realm>(),
    connectedRealms: new Map<number, ConnectedRealm>(),
    addOrUpdateConditionDialog: {
      targetRules: [
        (target: string) => !!target || 'Target is required',
        (target: string) => Utilities.validateEmail(target) || 'Please enter a valid email'
      ],
      thresholdRules: [(threshold: number) => threshold > 0 || 'Threshold must be greater than 0'],
      showDialog: false,
      formValid: false,
      metrics: Object.values(AlertConditionMetric).map(value => ({
        text: Utilities.splitAtUpperCase(value),
        value
      })),
      operators: Object.values(AlertConditionOperator).map(value => ({
        text: Utilities.splitAtUpperCase(value),
        value
      })),
      aggregations: Object.values(AlertConditionAggregationType).map(value => ({
        text: Utilities.splitAtUpperCase(value),
        value
      })),
      currentIndex: null as number | null,
      newOrUpdatedCondition: {} as CreateAlertConditionRequest & { wowItem?: WoWItem | null; realm?: Realm | null }
    },
    addOrUpdateActionDialog: {
      targetRules: [
        (target: string) => !!target || 'Target is required',
        (target: string) => Utilities.validateEmail(target) || 'Please enter a valid email'
      ],
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
        console.error('Add or update action form invalid.');
        return;
      }

      if (typeof this.addOrUpdateActionDialog.currentIndex === 'number') {
        this.alertToModify.actions[this.addOrUpdateActionDialog.currentIndex] = {
          ...this.addOrUpdateActionDialog.newOrUpdatedAction
        };
      } else {
        this.alertToModify.actions.push({ ...this.addOrUpdateActionDialog.newOrUpdatedAction });
      }

      this.addOrUpdateActionDialog.showDialog = false;
      this.resetAddOrUpdateActionForm();
    },

    getItemQualityColor(quality: string, id: number): WoWItemQualityColor {
      return ColorUtilities.getItemQualityColor(quality, uiSettingsService.darkThemeSet, id);
    },

    genFilteredColoredText(
      text: string,
      textColor: string,
      parent?: { genFilteredText(text: string): string }
    ): string {
      let result = parent?.genFilteredText(text) ?? '';
      const search = '<span';
      const spanIndex = result.indexOf(search);

      if (spanIndex >= 0) {
        result = Utilities.insert(result, spanIndex + search.length, ` style="color: ${textColor}"`);
      }

      return `<span style="color: ${textColor}">${result}</span>`;
    },

    addOrUpdateCondition(): void {
      if (!this.addOrUpdateConditionDialog.formValid || !this.addOrUpdateConditionDialog.newOrUpdatedCondition) {
        console.error('Add or update condition form invalid.');
        return;
      }

      if (typeof this.addOrUpdateConditionDialog.currentIndex === 'number') {
        this.alertToModify.conditions[this.addOrUpdateConditionDialog.currentIndex] = {
          ...this.addOrUpdateConditionDialog.newOrUpdatedCondition
        };
      } else {
        this.alertToModify.conditions.push({ ...this.addOrUpdateConditionDialog.newOrUpdatedCondition });
      }

      this.addOrUpdateConditionDialog.showDialog = false;
      this.resetAddOrUpdateConditionForm();
    },

    openAddOrUpdateActionDialog(index?: number): void {
      if (typeof index === 'number') {
        this.addOrUpdateActionDialog.currentIndex = index;
        this.addOrUpdateActionDialog.newOrUpdatedAction = { ...this.alertToModify.actions[index] };
      } else {
        this.addOrUpdateActionDialog.currentIndex = null;
        this.addOrUpdateActionDialog.newOrUpdatedAction = {
          type: AlertActionType.Email,
          actionOn: AlertActionOnType.AlertActivated,
          target: ''
        };
      }

      this.addOrUpdateActionDialog.showDialog = true;
    },

    openAddOrUpdateConditionDialog(index?: number): void {
      if (typeof index === 'number') {
        this.addOrUpdateConditionDialog.currentIndex = index;
        this.addOrUpdateConditionDialog.newOrUpdatedCondition = { ...this.alertToModify.conditions[index] };
      } else {
        this.addOrUpdateConditionDialog.currentIndex = null;
        this.addOrUpdateConditionDialog.newOrUpdatedCondition = {
          wowItem: this.wowItemId ? this.items.find(item => item.id === this.wowItemId) : null, // can't use lookup due to needing item from autocomplete box
          wowItemId: this.wowItemId ?? 0,
          connectedRealmId: this.connectedRealmId ?? 0,
          realm: this.connectedRealmId
            ? this.realms.find(realm => realm.connectedRealmId === this.connectedRealmId)
            : null, // can't use lookup due to needing item from autocomplete box
          metric: AlertConditionMetric.MinPrice,
          operator: AlertConditionOperator.GreaterThan,
          threshold: 10000,
          aggregationType: AlertConditionAggregationType.Max,
          aggregationTimeGranularityInHours: 1
        };
      }

      this.addOrUpdateConditionDialog.showDialog = true;
    },

    getConditionString(condition: AlertCondition | CreateAlertConditionRequest): string {
      const item = this.itemsLookup.get(condition.wowItemId);
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
      this.addOrUpdateActionDialog.currentIndex = null;
      (this.$refs.addOrUpdateActionForm as any).reset();
    },

    resetAddOrUpdateConditionForm(): void {
      this.addOrUpdateConditionDialog.currentIndex = null;
      (this.$refs.addOrUpdateConditionForm as any).reset();
    },

    async loadItems(): Promise<void> {
      if (this.alert) {
        const items = await Promise.all(
          [
            ...new Set(
              typeof this.wowItemId === 'number'
                ? [...this.alert.conditions.map(condition => condition.wowItemId), this.wowItemId]
                : this.alert.conditions.map(condition => condition.wowItemId)
            )
          ].map(itemId => wowItemService.getItem(itemId))
        );

        for (const item of items) {
          if (item) {
            this.itemsLookup.set(item.id, item);
          }
        }
      } else if (typeof this.wowItemId === 'number') {
        const item = await wowItemService.getItem(this.wowItemId);

        if (item) {
          this.itemsLookup.set(this.wowItemId, item);
        }
      }
    },

    async searchItems(searchTerm: string): Promise<void> {
      this.itemsLoading = true;

      try {
        this.items = (await wowItemService.getItems({ nameLike: searchTerm, first: 25 }))
          .concat(this.items)
          .distinctBy(item => item.id)
          .pipe(item => this.itemsLookup.set(item.id, item))
          .orderBy(item => item.name)
          .toArray();
      } catch (error) {
        console.error(error);
      } finally {
        this.itemsLoading = false;
      }
    },

    // Must use 'function' syntax for correct 'this' binding
    debouncedSearchItems: debounce(function (
      this: Vue & { searchItems(searchTerm: string): Promise<void> },
      newValue: string
    ): void {
      this.searchItems(newValue);
    },
    500)
  },

  async mounted(): Promise<void> {
    this.loading = true;

    try {
      this.realms = (await realmService.getConnectedRealms())
        .pipe(connectedRealm => this.connectedRealms.set(connectedRealm.id, connectedRealm))
        .selectMany(connectedRealm => connectedRealm.realms)
        .pipe(realm => this.realmsLookup.set(realm.id, realm))
        .orderBy(realm => realm.name)
        .toArray();

      await this.loadItems();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  },

  watch: {
    async wowItemId(): Promise<void> {
      const item = await wowItemService.getItem(this.wowItemId);

      if (item) {
        this.items.push(item);
        this.itemsLookup.set(item.id, item);
      }
    },

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
              this.itemsLookup.set(item.id, item);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    itemsSearchTerm(newValue: string | null): void {
      if (!newValue) {
        return;
      }

      this.debouncedSearchItems(newValue);
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
