<template>
  <div class="about">
    <h1>This is the Dashboard</h1>
    <input v-model="status" type="number" />
    <input v-model="statusAfter" type="number" />
    <input v-model="delay" type="number" />
    <input v-model="per" type="number" />
    <button @click="test()">Test</button>
    <button @click="getUsers()">Test Get Users</button>
    <line-chart v-if="chartData2" :chartData="chartData2" :chartOptions="chartOptions"></line-chart>
    <line-chart :chartData="chartData"></line-chart>
    <line-chart :chartData="chartData"></line-chart>
  </div>
</template>

<script lang="ts">
import { userService, auctionTimeSeriesService } from '@/services';
import LineChart from '@/components/charts/LineChart.vue';
import Vue from 'vue';
import { ChartData, ChartOptions } from 'node_modules/@types/chart.js';
import colors from 'vuetify/lib/util/colors';

export default Vue.extend({
  name: 'Dashboard',

  components: {
    LineChart
  },

  data: () => ({
    status: 500,
    statusAfter: 200,
    delay: 0,
    per: 0,
    chartData: {
      labels: ['test', 'test2', 'test3'],
      datasets: [
        {
          label: 'LOL',
          backgroundColor: colors.red.base,
          data: [3, 6, 1]
        },
        {
          label: 'LOLZ',
          backgroundColor: colors.green.base,
          data: [6, 1, 4]
        }
      ]
    } as ChartData,
    chartData2: undefined as ChartData | undefined,
    chartOptions: undefined as ChartOptions | undefined
  }),

  methods: {
    async test(): Promise<void> {
      await userService.test(this.status, this.delay, this.statusAfter, this.per);
    },

    async getUsers(): Promise<void> {
      const users = await userService.getUsers();
      console.log(users);
    }
  },

  async mounted(): Promise<void> {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 30);

    const timeSeries = await auctionTimeSeriesService.getAuctionTimeSeries({
      wowItemId: 168589,
      connectedRealmId: 76,
      startDate: weekAgo.toISOString(),
      endDate: now.toISOString()
    });

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        ]
      }
    };

    this.chartData2 = {
      //labels: timeSeries.map(t => t.timestamp),
      datasets: [
        {
          label: 'Average',
          data: timeSeries.map(entry => ({ t: entry.timestamp, y: entry.averagePrice / 10000 })),
          pointRadius: 0
        },
        {
          label: 'Min',
          data: timeSeries.map(entry => ({ t: entry.timestamp, y: entry.minPrice / 10000 })),
          pointRadius: 0
        },
        {
          label: '50th Percentile',
          data: timeSeries.map(entry => ({ t: entry.timestamp, y: entry.price50Percentile / 10000 })),
          pointRadius: 0
        },
        {
          label: '75th Percentile',
          data: timeSeries.map(entry => ({ t: entry.timestamp, y: entry.price75Percentile / 10000 })),
          pointRadius: 0
        },
        {
          label: '95th Percentile',
          data: timeSeries.map(entry => ({ t: entry.timestamp, y: entry.price95Percentile / 10000 })),
          pointRadius: 0
        },
        {
          label: '99th Percentile',
          data: timeSeries.map(entry => ({ t: entry.timestamp, y: entry.price99Percentile / 10000 })),
          pointRadius: 0
        },
        {
          label: 'Max',
          data: timeSeries.map(entry => ({ t: entry.timestamp, y: entry.maxPrice / 10000 })),
          pointRadius: 0
        }
      ]
    };
  }
});
</script>
