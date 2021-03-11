<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import { Line } from 'vue-chartjs';
import { ChartData, ChartOptions } from 'chart.js';
import { ArrayUtilities, ColorUtilities } from '@/utilities';
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
    const context = (this.$refs.canvas as HTMLCanvasElement).getContext('2d');

    if (!context) {
      console.error('No context found.');
      return;
    }

    const getColor = (i: number, except: string[]): { gradient: CanvasGradient; color: string } => {
      const colorArr = Object.values(colors)
        .filter(c => c.base && !except.includes(c.base))
        .map(t => t.base); // [colors.red.base, colors.purple.base, colors.green.base, colors.amber.base];
      ArrayUtilities.shuffle(colorArr);

      const color = colorArr[i % colorArr.length];

      return ColorUtilities.getColorGradient(color, context);
    };

    const cs: string[] = [];

    this.chartData.datasets?.forEach((set, i) => {
      let cObject = getColor(i, cs);

      // while (cs.some(c => ColorUtilities.isClose(c, cObject.color, 50))) {
      //   cObject = getColor(i, cs);
      // }

      const { gradient, color } = cObject;

      cs.push(color);

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
