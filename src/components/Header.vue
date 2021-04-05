<template>
  <div>
    <v-navigation-drawer v-model="drawer" app clipped temporary>
      <v-list dense>
        <v-list-item v-if="!isUserLoggedIn" link to="/login">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="!isUserLoggedIn" link to="/register">
          <v-list-item-action>
            <v-icon>mdi-login</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Sign Up</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isUserLoggedIn" link to="/watch-lists">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Watch Lists</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link to="/about">
          <v-list-item-action>
            <v-icon>mdi-information</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isUserLoggedIn" link to="/test">
          <v-list-item-action>
            <v-icon>mdi-information</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Test</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link @click="showSettings = true">
          <v-list-item-action>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isUserLoggedIn" link @click="logout">
          <v-list-item-action>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="hidden-md-and-up"></v-app-bar-nav-icon>

      <router-link class="toolbar-title" to="/">
        <v-toolbar-title>
          <v-icon large color="green">mdi-chart-line</v-icon>
          <span class="hidden-sm-and-down ml-2">{{ title }}</span>
        </v-toolbar-title>
      </router-link>

      <v-spacer />

      <v-text-field placeholder="Search" prepend-inner-icon="mdi-magnify" filled rounded dense />

      <v-spacer />

      <div class="hidden-sm-and-down">
        <v-btn v-if="!isUserLoggedIn" link to="/login" text>Login</v-btn>
        <v-btn v-if="!isUserLoggedIn" link to="/register" text>Sign Up</v-btn>
        <v-btn v-if="isUserLoggedIn" link to="/watch-lists" text>Watch Lists</v-btn>
        <v-btn link to="/about" text>About</v-btn>
        <v-btn v-if="isUserLoggedIn" link to="/test" text>Test</v-btn>
        <v-btn v-if="isUserLoggedIn" @click="showSettings = true" text>Settings</v-btn>
        <v-btn v-if="isUserLoggedIn" @click="logout" text>Logout</v-btn>
      </div>

      <v-progress-linear
        :active="loading"
        indeterminate
        absolute
        bottom
        color="deep-purple accent-4"
      ></v-progress-linear>
    </v-app-bar>

    <v-dialog width="500" v-model="showSettings">
      <v-card>
        <v-card-title> Settings </v-card-title>

        <v-card-actions>
          <v-switch v-model="isDarkThemeSet" label="Dark Theme"></v-switch>
        </v-card-actions>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="showSettings = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Subscription } from 'rxjs';
import { authService } from '@/services/AuthService';
import { uiSettingsService } from '@/services/UISettingsService';
import { environmentService } from '@/services/EnvironmentService';
import { loadingService } from '@/services/LoadingService';

export default Vue.extend({
  name: 'Header',

  data: () => ({
    loading: false,
    showSettings: false,
    drawer: false,
    title: environmentService.appTitle,
    isUserLoggedIn: false,
    authChangedSubscription: new Subscription(),
    loadingStateChangedSubscription: new Subscription()
  }),

  methods: {
    logout(): void {
      authService.logout();
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
  },

  mounted(): void {
    this.isUserLoggedIn = authService.isUserLoggedIn;
    this.authChangedSubscription = authService.authChanged.subscribe(authStatus => (this.isUserLoggedIn = authStatus));
    this.loadingStateChangedSubscription = loadingService.loadingStateChanged.subscribe(
      loading => (this.loading = loading)
    );
  },

  beforeDestroy(): void {
    this.authChangedSubscription.unsubscribe();
    this.loadingStateChangedSubscription.unsubscribe();
  }
});
</script>

<style scoped>
.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}
</style>
