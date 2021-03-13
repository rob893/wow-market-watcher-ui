<template>
  <div class="about">
    <h1>This is the Dashboard</h1>
    <input v-model="status" type="number" />
    <input v-model="statusAfter" type="number" />
    <input v-model="delay" type="number" />
    <input v-model="per" type="number" />
    <button @click="test()">Test</button>
    <button @click="getUsers()">Test Get Users</button>
    <div v-if="chartDatas">
      <line-chart
        v-for="(chartData, index) in chartDatas"
        :key="index"
        :chartData="chartData"
        :chartOptions="chartOptions"
      ></line-chart>
    </div>
  </div>
</template>

<script lang="ts">
import { userService, auctionTimeSeriesService, authService, watchListService } from '@/services';
import LineChart from '@/components/charts/LineChart.vue';
import Vue from 'vue';
import { ChartData, ChartOptions } from 'node_modules/@types/chart.js';
import { Comparer } from '@/utilities';
import { AuctionTimeSeriesEntry } from '@/models';

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
    chartDatas: undefined as ChartData[] | undefined,
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
    const userId = authService.loggedInUser?.id ?? 0;

    const watchLists = await watchListService.getWatchListsForUser(userId);

    const watchList = watchLists[0];

    const timeSeriesPromises: Promise<AuctionTimeSeriesEntry[]>[] = [];

    const weekAgo = new Date();
    weekAgo.setDate(new Date().getDate() - 30);

    console.log(watchLists);

    for (const item of watchList.watchedItems) {
      timeSeriesPromises.push(
        auctionTimeSeriesService.getAuctionTimeSeries(
          {
            wowItemId: item.id,
            connectedRealmId: watchList.connectedRealmId,
            startDate: weekAgo.toISOString()
          },
          {
            orderBy: 'timestamp',
            comparer: Comparer.dateAscending
          }
        )
      );
    }

    const timeSeriesArr = await Promise.all(timeSeriesPromises);

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'BALLS'
      },
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

    const chartDatas: ChartData[] = [];

    for (const timeSeries of timeSeriesArr) {
      const mapped = timeSeries.reduce<{
        min: { t: string; y: number }[];
        max: { t: string; y: number }[];
        average: { t: string; y: number }[];
        price25: { t: string; y: number }[];
        price50: { t: string; y: number }[];
        price75: { t: string; y: number }[];
        price95: { t: string; y: number }[];
        price99: { t: string; y: number }[];
      }>(
        (prev, curr) => ({
          min: [...prev.min, { t: curr.timestamp, y: curr.minPrice / 10000 }],
          max: [...prev.max, { t: curr.timestamp, y: curr.maxPrice / 10000 }],
          average: [...prev.average, { t: curr.timestamp, y: curr.averagePrice / 10000 }],
          price25: [...prev.price25, { t: curr.timestamp, y: curr.price25Percentile / 10000 }],
          price50: [...prev.price50, { t: curr.timestamp, y: curr.price50Percentile / 10000 }],
          price75: [...prev.price75, { t: curr.timestamp, y: curr.price75Percentile / 10000 }],
          price95: [...prev.price95, { t: curr.timestamp, y: curr.price95Percentile / 10000 }],
          price99: [...prev.price99, { t: curr.timestamp, y: curr.price99Percentile / 10000 }]
        }),
        {
          min: [],
          max: [],
          average: [],
          price25: [],
          price50: [],
          price75: [],
          price95: [],
          price99: []
        }
      );

      chartDatas.push({
        datasets: [
          {
            label: 'Average',
            data: mapped.average,
            pointRadius: 0
          },
          {
            label: 'Min',
            data: mapped.min,
            pointRadius: 0,
            hidden: true
          },
          {
            label: 'Max',
            data: mapped.max,
            pointRadius: 0,
            hidden: true
          },
          {
            label: '25th Percentile',
            data: mapped.price25,
            pointRadius: 0,
            hidden: true
          },
          {
            label: '50th Percentile',
            data: mapped.price50,
            pointRadius: 0
          },
          {
            label: '75th Percentile',
            data: mapped.price75,
            pointRadius: 0,
            hidden: true
          },
          {
            label: '95th Percentile',
            data: mapped.price95,
            pointRadius: 0,
            hidden: true
          },
          {
            label: '99th Percentile',
            data: mapped.price99,
            pointRadius: 0,
            hidden: true
          }
        ]
      });

      this.chartDatas = chartDatas;
    }
  }
});
</script>
