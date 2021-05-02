<template>
  <v-container fluid>
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="justify-center">Are you sure you want to delete your account?</v-card-title>

        <v-card-text>
          All of your data will be deleted. This is not reversible. After your account has been deleted, you will be
          logged out and returned to the login page.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelDeleteAccount">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="deleteAccount">Delete My Account</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card>
      <v-card-title>Account</v-card-title>
      <v-tabs v-model="tab">
        <v-tab>Profile</v-tab>
        <v-tab>Preferences</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card>
            <v-card-text>Stuff about you... Blah Blah Blah</v-card-text>
            <v-card-actions>
              <v-btn color="error" @click="showDeleteDialog = true">
                <v-icon left> mdi-delete </v-icon>Delete Account
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <v-card>
            <v-card-actions>
              <v-switch v-model="isDarkThemeSet" label="Dark Theme"></v-switch>
            </v-card-actions>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { uiSettingsService, userService, authService, loadingService, loggerService } from '@/services';
import { UserMixin } from '@/mixins/UserMixin';

export default (Vue as VueConstructor<Vue & InstanceType<typeof UserMixin>>).extend({
  name: 'Account',

  mixins: [UserMixin],

  data: () => ({
    tab: null,
    showDeleteDialog: false
  }),

  methods: {
    cancelDeleteAccount(): void {
      this.showDeleteDialog = false;
    },

    async deleteAccount(): Promise<void> {
      try {
        this.showDeleteDialog = false;
        loadingService.startLoading();

        await userService.deleteUser(this.userId);
        authService.logout();
      } catch (error) {
        loggerService.error(error);
      } finally {
        loadingService.stopLoading();
      }
    }
  },

  computed: {
    isDarkThemeSet: {
      get(): boolean {
        return uiSettingsService.darkThemeSet;
      },

      set(value: boolean): void {
        this.$vuetify.theme.dark = value;
        uiSettingsService.darkThemeSet = value;
      }
    }
  }
});
</script>
