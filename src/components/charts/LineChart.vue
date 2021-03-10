<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import { Line } from 'vue-chartjs';
import { ChartData, ChartOptions } from 'chart.js';
import { ArrayUtilities, ColorUtilities, Utilities } from '@/utilities';
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

    const getColor = (i: number): { gradient: CanvasGradient; color: string } => {
      const grad = (this.$refs.canvas as HTMLCanvasElement).getContext('2d')?.createLinearGradient(0, 0, 0, 450);

      const colorArr = Object.values(colors)
        .filter(c => c.base)
        .map(t => t.base); // [colors.red.base, colors.purple.base, colors.green.base, colors.amber.base];
      ArrayUtilities.shuffle(colorArr);

      const color = colorArr[i % colorArr.length];

      const rgb = ColorUtilities.hexToRgb(color) ?? { r: '', g: '', b: '' };

      grad?.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
      grad?.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.01)`);
      grad?.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      return {
        gradient: grad!,
        color
      };
    };

    const rgb = ColorUtilities.hexToRgb(colors.red.base) ?? { r: '', g: '', b: '' };

    this.gradient?.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
    this.gradient?.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
    this.gradient?.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    const { r, g, b } = ColorUtilities.hexToRgb(colors.purple.base) ?? {};

    this.gradient2?.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
    this.gradient2?.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.25)`);
    this.gradient2?.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    this.chartData.datasets?.forEach((set, i) => {
      const { gradient, color } = getColor(i);
      set.backgroundColor = gradient;
      set.borderColor = color;
      //set.pointBackgroundColor = color;
      set.borderWidth = 1;
      //set.pointBorderColor = color;
      set.fill = true;
    });

    this.renderChart(this.chartData, this.chartOptions);
  }
});
</script>
