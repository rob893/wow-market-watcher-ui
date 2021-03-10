<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import { Line } from 'vue-chartjs';
import { ChartData, ChartOptions } from 'chart.js';
import { Utilities } from '@/utilities';
import colors from 'vuetify/es5/util/colors';

/**
 * https://github.com/apertureless/vue-chartjs
 *
 * NOTE:
 * You can create your components in Vues single file components.
 * However it is important that you do not have the <template></template> included. Because Vue can't merge templates.
 * And the template is included in the mixin. If you leave the template tag in your component, it will overwrite the one which comes from the base chart and you will have a blank screen.
 */

export default (Vue as VueConstructor<Vue & InstanceType<typeof Line>>).extend({
  name: 'LineChart',
  extends: Line,

  props: {
    chartData: {
      type: Object as PropType<ChartData>,
      default: () => ({
        labels: [],
        datasets: []
      })
    },
    chartOptions: {
      type: Object as PropType<ChartOptions>,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false
      })
    }
  },

  data: () => ({
    gradient: undefined as CanvasGradient | undefined,
    gradient2: undefined as CanvasGradient | undefined
  }),

  mounted(): void {
    this.gradient = (this.$refs.canvas as HTMLCanvasElement).getContext('2d')?.createLinearGradient(0, 0, 0, 450);
    this.gradient2 = (this.$refs.canvas as HTMLCanvasElement).getContext('2d')?.createLinearGradient(0, 0, 0, 450);

    // this.gradient?.addColorStop(0, 'rgba(255, 0,0, 0.6)');
    // this.gradient?.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
    // this.gradient?.addColorStop(1, 'rgba(255, 0, 0, 0)');

    // this.gradient2?.addColorStop(0, 'rgba(0, 231, 255, 0.9)');
    // this.gradient2?.addColorStop(0.5, 'rgba(0, 231, 255, 0.25)');
    // this.gradient2?.addColorStop(1, 'rgba(0, 231, 255, 0)');

    const rgb = Utilities.hexToRgb(colors.red.base) ?? { r: '', g: '', b: '' };

    this.gradient?.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
    this.gradient?.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
    this.gradient?.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    const { r, g, b } = Utilities.hexToRgb(colors.purple.base) ?? {};

    this.gradient2?.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
    this.gradient2?.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.25)`);
    this.gradient2?.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    this.chartData.datasets?.forEach((set, i) => {
      const gradient = i % 2 === 0 ? this.gradient : this.gradient2;
      set.backgroundColor = gradient;
      set.borderColor = i % 2 === 0 ? colors.red.base : colors.purple.base;
      set.pointBackgroundColor = i % 2 === 0 ? colors.red.base : colors.purple.base;
      set.borderWidth = 1;
      set.pointBorderColor = i % 2 === 0 ? colors.red.base : colors.purple.base;
    });

    this.renderChart(this.chartData, this.chartOptions);
  }
});
</script>
