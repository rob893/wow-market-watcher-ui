<template>
  <div>
    <v-container fluid fill-height>
      <v-row align="center" justify="center">
        <v-col>
          <v-card class="mx-auto" elevation="2" max-width="400">
            <v-form ref="form" v-model="formValid" @submit.prevent="login">
              <v-card-title class="justify-center">Login</v-card-title>

              <v-card-text>
                <v-alert v-model="showErrorAlert" type="error" dismissible>{{ errorMessage }}</v-alert>

                <v-text-field
                  v-model="username"
                  :rules="usernameRules"
                  label="Username"
                  autocomplete="current-username"
                  required
                />
                <v-text-field
                  v-model="password"
                  type="password"
                  :rules="passwordRules"
                  label="Password"
                  autocomplete="current-password"
                  required
                />
              </v-card-text>

              <div v-if="!loading">
                <v-card-actions class="justify-center">
                  <v-btn :disabled="!formValid" color="success" class="mr-4" type="submit" @click="login">Login</v-btn>
                  <v-btn color="error" class="mr-4" @click="resetForm">Clear</v-btn>
                </v-card-actions>

                <v-card-text class="text-center"><strong>Or</strong></v-card-text>

                <v-card-actions class="justify-center">
                  <v-btn color="white" class="google-btn" @click="googleLogin"
                    ><img src="img/google-logo.png" alt="Google logo" class="google-btn-logo" /><span
                      class="google-btn-text"
                      >Continue with Google</span
                    ></v-btn
                  >
                </v-card-actions>

                <v-card-actions class="justify-center">
                  <router-link to="/auth/register">Not signed up yet? Sign up!</router-link>
                </v-card-actions>
              </div>

              <v-card-actions v-else class="justify-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-card-actions>

              <br />
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { authService, googleAuthService } from '@/services';
import { TypeGuards } from '@/utilities/TypeGuards';
import { RouteName } from '@/router/RouteName';
import { LinkedAccountType } from '@/models';

export default Vue.extend({
  name: 'Login',

  data: () => ({
    username: null as string | null,
    usernameRules: [(username: string) => !!username || 'Username is required'],
    password: null as string | null,
    passwordRules: [(password: string) => !!password || 'Password is required'],
    formValid: false,
    errorMessage: null as string | null,
    showErrorAlert: false,
    loading: false
  }),

  methods: {
    async googleLogin(): Promise<void> {
      this.loading = true;
      this.clearErrorMessage();

      try {
        const googleUser = await googleAuthService.signIn();
        const idToken = googleUser.getAuthResponse().id_token;
        await authService.loginGoogle(idToken);
        this.errorMessage = null;
        this.$router.push({ name: RouteName.WatchLists });
      } catch (error) {
        if (TypeGuards.isAxiosError(error) && error.response?.status === 404) {
          this.$router.push({ name: RouteName.Register, query: { socialLogin: LinkedAccountType.Google } });
        } else {
          this.showErrorMessage('Unable to login with Google.');
        }
      } finally {
        this.loading = false;
      }
    },

    async login(): Promise<void> {
      this.clearErrorMessage();

      if (!this.username || !this.password) {
        this.showErrorMessage('Username and password are required.');
        return;
      }

      try {
        this.loading = true;
        await authService.login(this.username, this.password);
        this.errorMessage = null;
        this.$router.push({ name: RouteName.WatchLists });
      } catch (error) {
        if (TypeGuards.isAxiosError(error) && error.response?.status === 401) {
          this.showErrorMessage('Invalid username or password.');
        } else {
          this.showErrorMessage('Unable to login.');
        }
      } finally {
        this.loading = false;
      }
    },

    showErrorMessage(message: string): void {
      this.errorMessage = message;
      this.showErrorAlert = true;
    },

    clearErrorMessage(): void {
      this.errorMessage = null;
      this.showErrorAlert = false;
    },

    resetForm(): void {
      this.errorMessage = null;
      (this.$refs.form as any).reset();
    }
  }
});
</script>

<style scoped>
.google-btn {
  width: 240px;
  height: 36px;
}
.google-btn-text {
  color: black;
}

.google-btn-logo {
  width: 2rem;
  height: 2rem;
  padding: 3%;
}
</style>
