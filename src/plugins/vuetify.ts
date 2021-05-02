import Vue from 'vue';
import Vuetify from 'vuetify';
import { uiSettingsService } from '@/services/UISettingsService';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        accent: colors.indigo.base
      },
      dark: {
        accent: colors.indigo.base
      }
    },
    dark: uiSettingsService.darkThemeSet
  }
});
