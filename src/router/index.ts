import Vue from 'vue';
import VueRouter from 'vue-router';
import Account from '@/views/Account.vue';
import Alerts from '@/views/Alerts.vue';
import Register from '@/views/auth/Register.vue';
import Login from '@/views/auth/Login.vue';
import ConfirmEmail from '@/views/auth/ConfirmEmail.vue';
import Test from '@/views/Test.vue';
import WatchLists from '@/views/WatchLists.vue';
import WatchList from '@/views/WatchList.vue';
import Privacy from '@/views/Privacy.vue';
import NotFound from '@/views/NotFound.vue';
import FAQ from '@/views/FAQ.vue';
import Forbidden from '@/views/Forbidden.vue';
import { authService, loadingService } from '@/services';
import { RouteName } from './RouteName';
import { HttpStatusCode } from '@/models';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/auth/register',
      name: RouteName.Register,
      component: Register
    },
    {
      path: '/auth/login',
      name: RouteName.Login,
      component: Login
    },
    {
      path: '/auth/confirm-email',
      name: RouteName.ConfirmEmail,
      component: ConfirmEmail
    },
    {
      path: '/auth/forgot-password',
      name: RouteName.ForgotPassword
    },
    {
      path: '/auth/reset-password',
      name: RouteName.ResetPassword
    },
    {
      path: '/account',
      name: RouteName.Account,
      component: Account
    },
    {
      path: '/alerts',
      name: RouteName.Alerts,
      component: Alerts
    },
    {
      path: '/watch-lists/:id',
      name: RouteName.WatchList,
      component: WatchList,
      props: true
    },
    {
      path: '/watch-lists',
      name: RouteName.WatchLists,
      component: WatchLists
    },
    {
      path: '/test',
      name: RouteName.Test,
      component: Test
    },
    {
      path: '/faq',
      name: RouteName.FAQ,
      component: FAQ
    },
    {
      path: '/privacy',
      name: RouteName.Privacy,
      component: Privacy
    },
    {
      path: '/not-found',
      name: RouteName.NotFound,
      component: NotFound
    },
    {
      path: '/forbidden',
      name: RouteName.Forbidden,
      component: Forbidden
    },
    {
      path: '*',
      name: RouteName.Default,
      component: WatchLists
    }
  ]
});

const unauthenticatedRoutes = new Set<RouteName | string | null | undefined>([
  RouteName.Login,
  RouteName.Register,
  RouteName.ForgotPassword,
  RouteName.ResetPassword,
  RouteName.ConfirmEmail,
  RouteName.NotFound,
  RouteName.Forbidden,
  RouteName.FAQ,
  RouteName.Privacy
]);

router.beforeEach((to, _from, next) => {
  loadingService.stopLoading();

  if (!unauthenticatedRoutes.has(to.name) && !authService.isUserLoggedIn) {
    next({ name: RouteName.Login });
  } else {
    next();
  }
});

authService.unauthorizedActionAttempted.subscribe(status => {
  if (status === HttpStatusCode.Forbidden) {
    router.push({ name: RouteName.Forbidden });
  } else {
    authService.logout();
  }
});

authService.authChanged.subscribe(authStatus => {
  if (!authStatus) {
    router.push({ name: RouteName.Login });
  }
});

export default router;
