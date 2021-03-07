import Vue from 'vue';
import Vuetify from 'vuetify';
import { uiSettingsService } from '@/services/UISettingsService';
// import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    // themes: {
    //   light: {
    //     primary: colors.red.darken1, // #E53935
    //     secondary: colors.red.lighten4, // #FFCDD2
    //     accent: colors.indigo.base
    //   }
    // },
    dark: uiSettingsService.darkThemeSet
  }
});
