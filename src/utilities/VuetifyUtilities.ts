import colors from 'vuetify/es5/util/colors';

export class VuetifyUtilities {
  public static readonly colors: { base: string[] } = {
    base: Object.values(colors)
      .filter(c => c.base)
      .map(c => c.base)
  };
}
