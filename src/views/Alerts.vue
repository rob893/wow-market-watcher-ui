<template>
  <v-container fluid>
    <alert-designer v-model="showCreateAlertDialog" :alert="selectedAlert"> </alert-designer>
    <v-row v-if="!pageLoading">
      <v-col cols="12">
        <v-card>
          <v-card-title>My Alerts</v-card-title>
          <v-card-actions>
            <v-btn color="success" @click="showCreateAlertDialog = !showCreateAlertDialog"
              ><v-icon left> mdi-plus </v-icon>Create Alert</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-if="alerts.length === 0">
        <v-card elevation="2">
          <v-card-text> You have no alerts. </v-card-text>
        </v-card>
      </v-col>

      <v-col v-else v-for="alert in alerts" :key="alert.id" cols="12">
        <v-card :style="{ border: `1px solid ${getAlertColor(alert)}` }">
          <v-card-title
            >{{ alert.name }}
            <v-spacer />
            State: {{ splitAtUpperCase(alert.state) }}
          </v-card-title>
          <v-card-subtitle>
            <v-row>
              <v-col cols="6" md="9">
                {{ alert.description }}
              </v-col>
              <v-col cols="6" md="3" class="text-right">
                Last Fired:
                {{
                  alert.lastFired
                    ? new Date(alert.lastFired).toLocaleString('en-US', { timeStyle: 'short', dateStyle: 'short' })
                    : 'N/A'
                }}<br />Last Evaluated:
                {{
                  alert.lastEvaluated
                    ? new Date(alert.lastEvaluated).toLocaleString('en-US', { timeStyle: 'short', dateStyle: 'short' })
                    : 'N/A'
                }}
              </v-col>
            </v-row>
          </v-card-subtitle>
          <v-card-text><strong>Conditions</strong> <br /><span v-html="getConditionsString(alert)" /></v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              @click="
                selectedAlert = alert;
                showCreateAlertDialog = true;
              "
              ><v-icon left> mdi-pencil </v-icon>Edit</v-btn
            >
            <v-btn
              color="error"
              @click="
                stagedAlertToDelete = alert;
                showDeleteDialog = true;
              "
              ><v-icon left> mdi-delete </v-icon>Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-else>
      <v-skeleton-loader v-for="n in 3" :key="n" type="card" v-bind:class="n != 3 ? 'mb-6' : ''" elevation="2" />
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import colors from 'vuetify/es5/util/colors';
import AlertDesigner from '@/components/AlertDesigner.vue';
import { loadingService, realmService, wowItemService } from '@/services';
import { UserMixin } from '@/mixins/UserMixin';
import { Subscription } from 'rxjs';
import { Alert, AlertConditionMetric, AlertState, ConnectedRealm, Realm, WoWItem } from '@/models';
import { alertService } from '@/services/AlertService';
import { Utilities } from '@/utilities';
import { from, List } from 'typescript-extended-linq';

export default (Vue as VueConstructor<Vue & InstanceType<typeof UserMixin>>).extend({
  name: 'Alerts',

  components: {
    AlertDesigner
  },

  mixins: [UserMixin],

  data: () => ({
    pageLoading: false,
    loadingSubscription: new Subscription(),
    alerts: new List<Alert>(),
    selectedAlert: null as Alert | null,
    showDeleteDialog: false,
    stagedAlertToDelete: null as Alert | null,
    items: new Map<number, WoWItem>(),
    realms: [] as Realm[],
    realmsLookup: new Map<number, Realm>(),
    connectedRealms: new Map<number, ConnectedRealm>(),
    showCreateAlertDialogField: false
  }),

  methods: {
    getAlertColor(alert: Alert): string {
      switch (alert.state) {
        case AlertState.InsufficientData:
          return colors.amber.darken2;
        case AlertState.Alarm:
          return colors.red.darken2;
        case AlertState.Ok:
          return colors.green.darken2;
        default:
          throw new Error(`${alert.state} is an invalid state.`);
      }
    },

    splitAtUpperCase(str: string): string {
      return Utilities.splitAtUpperCase(str);
    },

    getConditionsString(alert: Alert): string {
      return alert.conditions.reduce((prev, curr, i) => {
        const item = this.items.get(curr.wowItemId);
        const realms = this.connectedRealms.get(curr.connectedRealmId)?.realms ?? [];
        const { g, s, c } = Utilities.convertToGoldSilverCopper(curr.threshold);

        return `${prev} ${Utilities.splitAtUpperCase(
          curr.aggregationType
        ).toLowerCase()} of ${Utilities.splitAtUpperCase(
          curr.metric
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
        )} is ${Utilities.splitAtUpperCase(curr.operator).toLowerCase()} ${
          curr.metric === AlertConditionMetric.TotalAvailableForAuction
            ? curr.threshold.toLocaleString('en-US')
            : `${g.toLocaleString('en-US')}g ${s}s ${c}c`
        } over period of ${curr.aggregationTimeGranularityInHours} hour${
          curr.aggregationTimeGranularityInHours === 1 ? '' : 's'
        }${i === alert.conditions.length - 1 ? '.' : ' AND when'}`;
      }, 'When');
    }
  },

  computed: {
    showCreateAlertDialog: {
      get(): boolean {
        return this.showCreateAlertDialogField;
      },

      set(value: boolean): void {
        if (!value) {
          this.selectedAlert = null;
        }

        this.showCreateAlertDialogField = value;
      }
    }
  },

  async mounted(): Promise<void> {
    this.loadingSubscription = loadingService.loadingStateChanged.subscribe(loading => (this.pageLoading = loading));
    loadingService.startLoading();

    const realmsPromise = realmService.getConnectedRealms();
    const alerts = await alertService.getAlertsForUser(this.userId);
    const connectedRealms = await realmsPromise;
    const items = await Promise.all(
      alerts
        .selectMany(alert => alert.conditions)
        .select(condition => condition.wowItemId)
        .distinct()
        .select(itemId => wowItemService.getItem(itemId))
    );

    for (const item of items) {
      if (item) {
        this.items.set(item.id, item);
      }
    }

    this.connectedRealms = from(connectedRealms).toMap(connectedRealm => connectedRealm.id);

    this.realms = from(connectedRealms)
      .selectMany(r => r.realms)
      .pipe(realm => this.realmsLookup.set(realm.id, realm))
      .orderBy(realm => realm.name)
      .toArray();

    this.alerts = alerts;

    loadingService.stopLoading();
  },

  beforeDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }
});
</script>
