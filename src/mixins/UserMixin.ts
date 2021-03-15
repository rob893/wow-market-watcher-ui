import Vue from 'vue';
import { User } from '@/models';
import { authService, loggerService } from '@/services';

export const UserMixin = Vue.extend({
  data: () => ({
    user: {} as User,
    userId: NaN
  }),

  mounted(): void {
    const user = authService.loggedInUser;

    if (!user) {
      authService.unauthorizedActionAttempted.next();
      loggerService.warn(`No user logged in.`);
      return;
    }

    this.user = user;
    this.userId = user.id;
  }
});
