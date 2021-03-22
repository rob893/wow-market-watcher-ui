<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import colors from 'vuetify/es5/util/colors';
import { Line, mixins } from 'vue-chartjs';
import { ChartOptions } from 'chart.js';
import { ChartPlugin, ColorUtilities } from '@/utilities';
import { loggerService } from '@/services';

/**
 * https://github.com/apertureless/vue-chartjs
 *
 * NOTE:
 * You can create your components in Vues single file components.
 * However it is important that you do not have the <template></template> included. Because Vue can't merge templates.
 * And the template is included in the mixin. If you leave the template tag in your component, it will overwrite the one which comes from the base chart and you will have a blank screen.
 */

const { reactiveProp } = mixins;

export default (Vue as VueConstructor<Vue & InstanceType<typeof Line> & InstanceType<typeof reactiveProp>>).extend({
  name: 'LineChart',
  extends: Line,

  mixins: [reactiveProp],

  props: {
    chartOptions: {
      type: Object as PropType<ChartOptions>,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false
      }),
      required: false
    },
    chartColors: {
      type: Array as PropType<string[]>,
      required: false,
      validator: value => {
        if (!Array.isArray(value)) {
          return false;
        }

        return value.every(v => typeof v === 'string');
      }
    },
    chartPlugins: {
      type: Array as PropType<ChartPlugin[]>,
      required: false,
      default: () => []
    }
  },

  mounted(): void {
    const context = (this.$refs.canvas as HTMLCanvasElement).getContext('2d');

    if (!context) {
      loggerService.error('No context found.');
      return;
    }

    this.chartPlugins.forEach(plugin => this.addPlugin(plugin));

    const lineColors = this.chartColors ?? [
      colors.purple.base,
      colors.blue.base,
      colors.red.base,
      colors.amber.base,
      colors.indigo.base,
      colors.green.base,
      colors.pink.base,
      colors.cyan.base
    ];

    this.chartData.datasets?.forEach((set, i) => {
      const { gradient, color } = ColorUtilities.getColorGradient(lineColors[i % lineColors.length], context);

      set.backgroundColor ??= gradient;
      set.borderColor ??= color;
      set.borderWidth ??= 1;
      set.fill ??= true;
    });

    this.renderChart(this.chartData, this.chartOptions);

    this.$on('chart:update', () => {
      this.chartData.datasets?.forEach((set, i) => {
        const { gradient, color } = ColorUtilities.getColorGradient(lineColors[i % lineColors.length], context);

        set.backgroundColor ??= gradient;
        set.borderColor ??= color;
        set.borderWidth ??= 1;
        set.fill ??= true;
      });

      this.renderChart(this.chartData, this.chartOptions);
    });
  }
});
</script>
