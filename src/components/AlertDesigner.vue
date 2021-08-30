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
              <v-list-item-title>Item and Realm</v-list-item-title>
              {{ condition.wowItemId }} {{ condition.connectedRealmId }}
            </v-list-item-content>
            <v-list-item-content>
              <v-list-item-title>Condition</v-list-item-title>
              {{ condition.aggregationType }} of {{ condition.metric }} {{ condition.operator }}
              {{ condition.threshold }} over period of {{ condition.aggregationTimeGranularityInHours }} hours.
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
import { Alert, AlertAction, AlertActionOnType, CreateAlertActionRequest, CreateAlertForUserRequest } from '@/models';
import Vue, { PropType } from 'vue';
import { cloneDeep } from 'lodash';

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

  watch: {
    alert(): void {
      this.alertToModify = cloneDeep(this.alert) ?? {
        name: '',
        description: '',
        conditions: [],
        actions: []
      };
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
