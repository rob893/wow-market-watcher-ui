<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Line } from 'vue-chartjs';
import { ChartData, ChartOptions } from 'chart.js';

/**
 * https://github.com/apertureless/vue-chartjs
 *
 * NOTE:
 * You can create your components in Vues single file components.
 * However it is important that you do not have the <template></template> included. Because Vue can't merge templates.
 * And the template is included in the mixin. If you leave the template tag in your component, it will overwrite the one which comes from the base chart and you will have a blank screen.
 */

export default (Vue as VueConstructor<Vue & InstanceType<typeof Line>>).extend({
  name: 'TestChart',
  extends: Line,
  data: () => ({
    chartdata: {
      labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Data One',
          backgroundColor: '#f87979',
          data: [40, 20, 21, 25, 19, 30, 29, 22, 25, 26, 35, 39]
        }
      ]
    } as ChartData,
    options: {
      responsive: true,
      maintainAspectRatio: false
    } as ChartOptions
  }),

  mounted(): void {
    this.renderChart(this.chartdata, this.options);
  }
});
</script>
