<template>
  <v-dialog fullscreen hide-overlay transition="dialog-bottom-transition" v-model="show">
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Alert Designer</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="show = false"> Save </v-btn>
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
      <v-divider></v-divider>
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
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Alert, CreateAlertForUserRequest, WatchedItem } from '@/models';
import Vue, { PropType } from 'vue';
import { cloneDeep } from 'lodash';

export default Vue.extend({
  name: 'AlertDesigner',

  props: {
    value: Boolean,
    watchedItem: {
      type: Object as PropType<WatchedItem>,
      required: false
    },
    alert: {
      type: Object as PropType<Alert>,
      required: false
    }
  },

  data: () => ({
    nameRules: [(name: string) => !!name || 'Name is required'],
    alertToModify: {} as CreateAlertForUserRequest
  }),

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
