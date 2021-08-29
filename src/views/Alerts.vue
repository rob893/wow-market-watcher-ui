<template>
  <v-container fluid>
    <alert-designer v-model="showCreateAlertDialog" :alert="selectedAlert"> </alert-designer>
    <v-row v-if="!pageLoading">
      <v-col cols="12">
        <v-card>
          <v-card-title>My Alerts</v-card-title>
          <v-spacer />
          <v-btn color="success" @click="showCreateAlertDialog = !showCreateAlertDialog"
            ><v-icon left> mdi-plus </v-icon>Create Alert</v-btn
          >
        </v-card>
      </v-col>

      <v-col v-if="alerts.length === 0">
        <v-card elevation="2">
          <v-card-text> You have no alerts. </v-card-text>
        </v-card>
      </v-col>

      <v-col v-else v-for="alert in alerts" :key="alert.id" cols="12" lg="6">
        <v-card>
          <v-card-title>{{ alert.name }}</v-card-title>
          <v-card-text>
            {{ alert.description }}
          </v-card-text>
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
import AlertDesigner from '@/components/AlertDesigner.vue';
import { loadingService, realmService } from '@/services';
import { UserMixin } from '@/mixins/UserMixin';
import { Subscription } from 'rxjs';
import { Alert, ConnectedRealm, Realm } from '@/models';
import { alertService } from '@/services/AlertService';
import { ArrayUtilities } from '@/utilities';

export default (Vue as VueConstructor<Vue & InstanceType<typeof UserMixin>>).extend({
  name: 'Alerts',

  components: {
    AlertDesigner
  },

  mixins: [UserMixin],

  data: () => ({
    pageLoading: false,
    loadingSubscription: new Subscription(),
    alerts: [] as Alert[],
    selectedAlert: null as Alert | null,
    showDeleteDialog: false,
    stagedAlertToDelete: null as Alert | null,
    realms: [] as Realm[],
    realmsLookup: new Map<number, Realm>(),
    connectedRealms: new Map<number, ConnectedRealm>(),
    showCreateAlertDialogField: false
  }),

  methods: {},

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

    for (const connectedRealm of connectedRealms) {
      this.connectedRealms.set(connectedRealm.id, connectedRealm);

      for (const realm of connectedRealm.realms) {
        this.realmsLookup.set(realm.id, realm);
        this.realms.push(realm);
      }
    }

    ArrayUtilities.orderBy(this.realms, realm => realm.name);

    this.alerts = alerts;

    loadingService.stopLoading();
  },

  beforeDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }
});
</script>
