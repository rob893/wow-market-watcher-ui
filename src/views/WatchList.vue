<template>
  <v-container v-if="chartDatas" fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>{{ (watchList || {}).name }}</v-card-title>
          <v-card-text>{{ (watchList || {}).description }}</v-card-text>
          <v-card-actions>
            <v-btn @click="useMonthTimeRange">Month</v-btn>
            <v-btn @click="useWeekTimeRange">Week</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col v-for="({ data, name }, index) in chartDatas" :key="index" cols="12">
        <v-card elevation="2">
          <v-card-title>{{ name }}</v-card-title>
          <v-card-text>
            <line-chart :chartData="data" :chartOptions="chartOptions" :chartPlugins="chartPlugins" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { auctionTimeSeriesService, watchListService, loggerService } from '@/services';
import LineChart from '@/components/charts/LineChart.vue';
import Vue, { VueConstructor } from 'vue';
import { ChartData, ChartOptions } from 'node_modules/@types/chart.js';
import { Comparer, ChartPluginFactory } from '@/utilities';
import { AuctionTimeSeriesEntry, WatchList, WoWItem } from '@/models';
import { RouteName } from '@/router/RouteName';
import { UserMixin } from '@/mixins/UserMixin';

export default (Vue as VueConstructor<Vue & InstanceType<typeof UserMixin>>).extend({
  name: 'WatchList',

  components: {
    LineChart
  },

  mixins: [UserMixin],

  props: {
    id: {
      type: String,
      required: true
    }
  },

  data: () => ({
    watchList: undefined as WatchList | undefined,
    chartDatas: undefined as { data: ChartData; name: string }[] | undefined,
    timeseries: [] as AuctionTimeSeriesEntry[][],
    chartOptions: {
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
    } as ChartOptions,
    chartPlugins: [ChartPluginFactory.createVerticalLinePlugin()],
    wowItems: new Map<number, WoWItem>()
  }),

  methods: {
    useWeekTimeRange(): void {
      const weekAgo = new Date();
      weekAgo.setDate(new Date().getDate() - 7);
      const weekAgoTime = weekAgo.getTime();
      this.setChartDatas(
        this.timeseries.map(set => set.filter(({ timestamp }) => new Date(timestamp).getTime() > weekAgoTime))
      );
    },

    useMonthTimeRange(): void {
      this.setChartDatas(this.timeseries);
    },

    setChartDatas(timeSeriesArr: AuctionTimeSeriesEntry[][]): void {
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
            name: this.wowItems.get(curr.wowItemId)?.name ?? 'N/A',
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
  },

  async mounted(): Promise<void> {
    const watchList = await watchListService.getWatchListForUser(this.userId, Number(this.id));

    if (!watchList) {
      loggerService.warn(`No watch list found with id ${this.id} for user ${this.userId}`);
      this.$router.push({ name: RouteName.NotFound });
      return;
    }

    this.watchList = watchList;

    const timeSeriesPromises: Promise<AuctionTimeSeriesEntry[]>[] = [];

    const monthAgo = new Date();
    monthAgo.setDate(new Date().getDate() - 30);

    for (const item of watchList.watchedItems) {
      this.wowItems.set(item.id, item);
      timeSeriesPromises.push(
        auctionTimeSeriesService.getAuctionTimeSeries(
          {
            wowItemId: item.id,
            connectedRealmId: watchList.connectedRealmId,
            startDate: monthAgo.toISOString().split('T')[0]
          },
          {
            orderBy: 'timestamp',
            comparer: Comparer.dateAscending
          }
        )
      );
    }

    this.timeseries = await Promise.all(timeSeriesPromises);

    this.useWeekTimeRange();
  }
});
</script>
