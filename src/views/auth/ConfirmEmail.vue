<template>
  <div>
    <v-card>
      <v-card-text v-if="error"> We were not able to confirm your email. </v-card-text>

      <v-card-text v-else-if="emailConfirmed"> Thank you for confirming your email! </v-card-text>

      <v-card-text v-else> Please wait. We are confirming your email. </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { authService, loadingService } from '@/services';
import Vue from 'vue';

export default Vue.extend({
  name: 'ConfirmEmail',

  data: () => ({
    emailConfirmed: false,
    error: false
  }),

  async mounted(): Promise<void> {
    loadingService.startLoading();
    const { token, email } = this.$route.query;

    if (!token || !email) {
      loadingService.stopLoading();
      this.error = true;
      return;
    }

    try {
      await authService.confirmEmail(
        Array.isArray(email) ? email[0] ?? '' : email,
        Array.isArray(token) ? token[0] ?? '' : token
      );
      this.emailConfirmed = true;
    } catch (error) {
      this.error = true;
    } finally {
      loadingService.stopLoading();
    }
  }
});
</script>
