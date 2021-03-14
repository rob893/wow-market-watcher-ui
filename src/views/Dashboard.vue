<template>
  <div class="about">
    <h1>This is the Dashboard</h1>
    <div v-if="chartDatas">
      <div v-for="({ data, name }, index) in chartDatas" :key="index">
        <v-card elevation="2">
          <v-card-title>{{ name }}</v-card-title>
        </v-card>
        <line-chart :chartData="data" :chartOptions="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { auctionTimeSeriesService, authService, watchListService, loggerService } from '@/services';
import LineChart from '@/components/charts/LineChart.vue';
import Vue from 'vue';
import { ChartData, ChartOptions } from 'node_modules/@types/chart.js';
import { Comparer } from '@/utilities';
import { AuctionTimeSeriesEntry, WoWItem } from '@/models';

export default Vue.extend({
  name: 'Dashboard',

  components: {
    LineChart
  },

  data: () => ({
    chartDatas: undefined as { data: ChartData; name: string }[] | undefined,
    chartOptions: undefined as ChartOptions | undefined
  }),

  async mounted(): Promise<void> {
    const userId = authService.loggedInUser?.id ?? 0;

    const watchLists = await watchListService.getWatchListsForUser(userId);

    if (watchLists.length === 0) {
      loggerService.info('No watch lists');
      return;
    }

    const watchList = watchLists[0];

    const timeSeriesPromises: Promise<AuctionTimeSeriesEntry[]>[] = [];

    const weekAgo = new Date();
    weekAgo.setDate(new Date().getDate() - 30);

    const wowItems = new Map<number, WoWItem>();

    for (const item of watchList.watchedItems) {
      wowItems.set(item.id, item);
      timeSeriesPromises.push(
        auctionTimeSeriesService.getAuctionTimeSeries(
          {
            wowItemId: item.id,
            connectedRealmId: watchList.connectedRealmId,
            startDate: weekAgo.toISOString().split('T')[0]
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
      tooltips: {
        intersect: false,
        mode: 'index',
        callbacks: {
          title: items => (items.length > 0 ? new Date(items[0].label ?? '').toLocaleString('en-US') : 'No Label')
        }
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day'
            },
            gridLines: {
              display: false
            }
          }
        ],
        yAxes: [
          {
            gridLines: {
              display: false
            }
          }
        ]
      }
    };

    const chartDatas: { data: ChartData; name: string }[] = [];

    for (const timeSeries of timeSeriesArr) {
      const mapped = timeSeries.reduce<{
        name: string;
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
          name: wowItems.get(curr.wowItemId)?.name ?? 'N/A',
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
          name: '',
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
        name: mapped.name,
        data: {
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
        }
      });
    }

    this.chartDatas = chartDatas;
  }
});
</script>
