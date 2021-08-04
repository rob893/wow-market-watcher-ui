<template>
  <v-container fluid>
    <v-row v-if="!pageLoading && chartDatas">
      <v-col cols="12">
        <v-card v-if="watchList" elevation="2">
          <v-card-title>{{ watchList.name }}</v-card-title>
          <v-card-text>
            {{ watchList.description }}
            <br />
            {{
              `Realm${watchListConnectedRealm.realms.length > 1 ? 's' : ''}: ${watchListConnectedRealm.realms
                .map(r => r.name)
                .sort()
                .reduce((prev, curr, i) => `${i === 0 ? '' : `${prev}, `}${curr}`)}`
            }}
            <br />
            Population: {{ watchListConnectedRealm.population }}
          </v-card-text>
          <v-card-actions>
            <v-row>
              <v-col>
                <v-btn-toggle v-model="timeFrame" group>
                  <v-btn value="week" @click="useWeekTimeRange">Week</v-btn>
                  <v-btn value="twoWeeks" @click="useTwoWeekTimeRange">Two Weeks</v-btn>
                  <v-btn value="month" @click="useMonthTimeRange">Month</v-btn>
                </v-btn-toggle>
              </v-col>

              <v-spacer />

              <v-col>
                <v-autocomplete
                  v-model="selectedItemId"
                  :items="items"
                  :loading="itemsLoading"
                  :search-input.sync="itemsSearchTerm"
                  cache-items
                  item-text="name"
                  item-value="id"
                  class="mx-4"
                  hide-no-data
                  hide-details
                  label="Items"
                  @change="disableWoWHeadLinks"
                >
                  <template v-slot:item="{ parent, item }">
                    <v-list-item-content>
                      <v-list-item-title
                        v-html="
                          `${genFilteredColoredText(item.name, getItemQualityColor(item.quality, item.id), parent)}`
                        "
                      ></v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col>
                <v-btn color="success" @click="addSelectedItemToWatchList" :disabled="selectedItemId === null"
                  ><v-icon left> mdi-plus </v-icon>Add Item</v-btn
                >
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col v-for="{ data, name, id, itemQuality } in chartDatas" :key="id" cols="12">
        <v-card elevation="2">
          <v-card-title>
            <span :style="{ color: getItemQualityColor(itemQuality, id) }">{{ name }}</span>

            <v-spacer />

            <v-btn color="error" @click="removeItemFromWatchList(id)"><v-icon left> mdi-delete </v-icon>Remove</v-btn>
          </v-card-title>

          <v-card-subtitle>
            <a :href="`https://www.wowhead.com/item=${id}`" target="_blank">WoWHead Tooltip</a>
          </v-card-subtitle>

          <v-card-text>
            <p>
              Range Min: {{ getRangeStats(id).rangeMin.toLocaleString('en-US', { maximumFractionDigits: 2 }) }}g Range
              Max: {{ getRangeStats(id).rangeMax.toLocaleString('en-US', { maximumFractionDigits: 2 }) }}g
            </p>
            <p>
              Current Price
              {{ getRangeStats(id).currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) }}g ({{
                getRangeStats(id).currentPriceDescription
              }}: {{ getRangeStats(id).rangePercent.toFixed(2) }}%)
            </p>
            <line-chart
              v-if="
                data.datasets &&
                data.datasets.length > 0 &&
                data.datasets.some(set => Array.isArray(set.data) && set.data.length > 1)
              "
              :chartData="data"
              :chartOptions="chartOptions"
              :chartPlugins="chartPlugins"
            />
            <p v-else>Not enough data yet for this item. Please check back later!</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-else>
      <v-skeleton-loader v-for="n in 3" :key="n" type="card" v-bind:class="n != 3 ? 'mb-6' : ''" elevation="2" />
    </div>
  </v-container>
</template>

<script lang="ts">
import {
  auctionTimeSeriesService,
  watchListService,
  loggerService,
  realmService,
  wowItemService,
  loadingService
} from '@/services';
import colors from 'vuetify/es5/util/colors';
import LineChart from '@/components/charts/LineChart.vue';
import Vue, { VueConstructor } from 'vue';
import { debounce } from 'lodash';
import { ChartData, ChartOptions, ChartPoint } from 'node_modules/@types/chart.js';
import { Comparer, ChartPluginFactory, ArrayUtilities, ColorUtilities, Utilities, Constants } from '@/utilities';
import { AuctionTimeSeriesEntry, ConnectedRealm, TimeRangePriceStats, WatchList, WoWItem } from '@/models';
import { RouteName } from '@/router/RouteName';
import { UserMixin } from '@/mixins/UserMixin';
import { Subscription } from 'rxjs';
import { WoWItemQualityColor } from '@/models/blizzard';
import { uiSettingsService } from '@/services';
import { MathUtilities } from '@/utilities/MathUtilities';

type ChartTimeFrame = 'week' | 'twoWeeks' | 'month';

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
    pageLoading: false,
    pageLoadingSubscription: new Subscription(),
    watchList: undefined as WatchList | undefined,
    watchListConnectedRealm: {} as ConnectedRealm,
    rangeStats: new Map<number, TimeRangePriceStats>(),
    chartDatas: undefined as { data: ChartData; name: string; id: number; itemQuality: string }[] | undefined,
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        intersect: false,
        mode: 'index',
        callbacks: {
          title: items => (items.length > 0 ? new Date(items[0].label ?? '').toLocaleString('en-US') : 'No Label'),
          label: (tooltipItem, data) => {
            const datasets = data.datasets ?? [];

            const curr = datasets[tooltipItem.datasetIndex ?? 0];
            const currMessage = `${curr.label}: ${(
              (curr.data ?? [])[tooltipItem.index ?? 0] as ChartPoint
            ).y?.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

            return curr.label === 'Total Available' ? currMessage : `${currMessage}g`;
          }
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
            id: 'y-axis-price',
            position: 'left',
            scaleLabel: {
              display: true,
              labelString: 'Price'
            },
            gridLines: {
              display: false
            },
            ticks: {
              callback: label => `${label.toLocaleString('en-US', { maximumFractionDigits: 2 })}g`
            }
          },
          {
            id: 'y-axis-amount',
            position: 'right',
            scaleLabel: {
              display: true,
              labelString: 'Available'
            },
            gridLines: {
              display: false
            },
            ticks: {
              callback: label => `${label.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
            }
          }
        ]
      }
    } as ChartOptions,
    chartPlugins: [ChartPluginFactory.createVerticalLinePlugin()],
    wowItems: new Map<number, WoWItem>(),
    itemTimeseries: new Map<number, AuctionTimeSeriesEntry[]>(),
    timeFrame: 'week' as ChartTimeFrame,
    itemsLoading: false,
    items: [] as WoWItem[],
    itemsSearchTerm: null as string | null,
    selectedItemId: null as number | null
  }),

  methods: {
    disableWoWHeadLinks(): void {
      const elements = document.getElementsByClassName('wowhead-tooltip');

      for (const element of elements) {
        element.setAttribute('style', 'visibility: hidden;');

        const pElements = element.getElementsByTagName('p');

        for (const child of pElements) {
          child.setAttribute('style', 'visibility: hidden;');
        }
      }
    },

    getItemQualityColor(quality: string, id: number): WoWItemQualityColor {
      return ColorUtilities.getItemQualityColor(quality, uiSettingsService.darkThemeSet, id);
    },

    genFilteredColoredText(
      text: string,
      textColor: string,
      parent?: { genFilteredText(text: string): string }
    ): string {
      let result = parent?.genFilteredText(text) ?? '';
      const search = '<span';
      const spanIndex = result.indexOf(search);

      if (spanIndex >= 0) {
        result = Utilities.insert(result, spanIndex + search.length, ` style="color: ${textColor}"`);
      }

      return `<span style="color: ${textColor}">${result}</span>`;
    },

    useWeekTimeRange(): void {
      this.chartDatas = this.getChartDatas(this.getTimeAgo('week'));
    },

    useTwoWeekTimeRange(): void {
      this.chartDatas = this.getChartDatas(this.getTimeAgo('twoWeeks'));
    },

    useMonthTimeRange(): void {
      this.chartDatas = this.getChartDatas(this.getTimeAgo('month'));
    },

    getChartDatas(
      fromTime: number,
      timeSeriesEntries?: [number, AuctionTimeSeriesEntry[]][]
    ): { data: ChartData; name: string; id: number; itemQuality: string }[] {
      const chartDatas: { data: ChartData; name: string; id: number; itemQuality: string }[] = [];
      this.rangeStats.clear();

      for (const [key, timeSeries] of timeSeriesEntries ?? this.itemTimeseries.entries()) {
        const item = this.wowItems.get(key);

        const range = timeSeries.filter(({ timestamp }) => new Date(timestamp).getTime() > fromTime);

        const mapped = range.reduce<{
          name: string;
          id: number;
          itemQuality: string;
          min: { t: string; y: number }[];
          max: { t: string; y: number }[];
          average: { t: string; y: number }[];
          price25: { t: string; y: number }[];
          price50: { t: string; y: number }[];
          price75: { t: string; y: number }[];
          price95: { t: string; y: number }[];
          price99: { t: string; y: number }[];
          totalAvailable: { t: string; y: number }[];
        }>(
          (prev, curr) => {
            const min = curr.minPrice / 10000;

            const stats = this.rangeStats.get(prev.id);

            if (stats) {
              stats.rangeMin = Math.min(stats.rangeMin, min);
              stats.rangeMax = Math.max(stats.rangeMax, min);
              stats.currentPrice = min;
            } else {
              this.rangeStats.set(prev.id, {
                rangeMin: min,
                rangeMax: min,
                currentPrice: min,
                rangePercent: 0,
                currentPriceDescription: ''
              });
            }

            return {
              name: prev.name,
              id: prev.id,
              itemQuality: prev.itemQuality,
              min: [...prev.min, { t: curr.timestamp, y: min }],
              max: [...prev.max, { t: curr.timestamp, y: curr.maxPrice / 10000 }],
              average: [...prev.average, { t: curr.timestamp, y: curr.averagePrice / 10000 }],
              price25: [...prev.price25, { t: curr.timestamp, y: curr.price25Percentile / 10000 }],
              price50: [...prev.price50, { t: curr.timestamp, y: curr.price50Percentile / 10000 }],
              price75: [...prev.price75, { t: curr.timestamp, y: curr.price75Percentile / 10000 }],
              price95: [...prev.price95, { t: curr.timestamp, y: curr.price95Percentile / 10000 }],
              price99: [...prev.price99, { t: curr.timestamp, y: curr.price99Percentile / 10000 }],
              totalAvailable: [...prev.totalAvailable, { t: curr.timestamp, y: curr.totalAvailableForAuction }]
            };
          },
          {
            name: item?.name ?? 'N/A',
            id: item?.id ?? NaN,
            itemQuality: item?.quality ?? 'N/A',
            min: [],
            max: [],
            average: [],
            price25: [],
            price50: [],
            price75: [],
            price95: [],
            price99: [],
            totalAvailable: []
          }
        );

        const rangeStats = this.rangeStats.get(mapped.id);

        if (rangeStats) {
          rangeStats.rangePercent =
            MathUtilities.percentRank(
              range.map(ts => ts.minPrice / 10000),
              rangeStats.currentPrice
            ) * 100;

          const { rangePercent } = rangeStats;

          if (rangePercent <= 25) {
            rangeStats.currentPriceDescription = 'Cheap';
          } else if (rangePercent >= 75) {
            rangeStats.currentPriceDescription = 'Expensive';
          } else {
            rangeStats.currentPriceDescription = 'Average';
          }
        }

        chartDatas.push({
          name: mapped.name,
          id: mapped.id,
          itemQuality: mapped.itemQuality,
          data: {
            datasets:
              mapped.id === Constants.wowTokenId // Special logic for WoW Token
                ? [
                    {
                      label: 'Price',
                      data: mapped.min,
                      borderColor: colors.cyan.base,
                      pointRadius: 0,
                      hidden: false
                    }
                  ]
                : [
                    {
                      label: 'Total Available',
                      data: mapped.totalAvailable,
                      borderColor: colors.purple.base,
                      yAxisID: 'y-axis-amount',
                      pointRadius: 0,
                      hidden: false
                    },
                    {
                      label: 'Min',
                      data: mapped.min,
                      borderColor: colors.cyan.base,
                      pointRadius: 0,
                      hidden: false
                    },
                    {
                      label: 'Max',
                      data: mapped.max,
                      borderColor: colors.red.base,
                      pointRadius: 0,
                      hidden: true
                    },
                    {
                      label: 'Average',
                      data: mapped.average,
                      borderColor: colors.amber.base,
                      pointRadius: 0,
                      hidden: true
                    },
                    {
                      label: '25th Percentile',
                      data: mapped.price25,
                      borderColor: colors.indigo.base,
                      pointRadius: 0,
                      hidden: true
                    },
                    {
                      label: '50th Percentile',
                      data: mapped.price50,
                      borderColor: colors.green.base,
                      pointRadius: 0,
                      hidden: true
                    },
                    {
                      label: '75th Percentile',
                      data: mapped.price75,
                      borderColor: colors.pink.base,
                      pointRadius: 0,
                      hidden: true
                    },
                    {
                      label: '95th Percentile',
                      data: mapped.price95,
                      borderColor: colors.blue.base,
                      pointRadius: 0,
                      hidden: true
                    },
                    {
                      label: '99th Percentile',
                      data: mapped.price99,
                      borderColor: colors.lime.base,
                      pointRadius: 0,
                      hidden: true
                    }
                  ]
          }
        });
      }

      ArrayUtilities.orderBy(chartDatas, { orderBy: 'name' });

      return chartDatas;
    },

    getTimeAgo(timeFrame: ChartTimeFrame): number {
      const date = new Date();
      switch (timeFrame) {
        case 'week':
          date.setDate(new Date().getDate() - 7);
          return date.getTime();
        case 'twoWeeks':
          date.setDate(new Date().getDate() - 14);
          return date.getTime();
        case 'month':
          date.setMonth(new Date().getMonth() - 1);
          return date.getTime();
        default:
          return NaN;
      }
    },

    getRangeStats(itemId: number): TimeRangePriceStats {
      const stats = this.rangeStats.get(itemId);

      return stats ?? { rangeMin: 0, rangeMax: 0, currentPrice: 0, rangePercent: 0, currentPriceDescription: '' };
    },

    async removeItemFromWatchList(itemId: number): Promise<void> {
      if (!this.watchList) {
        return;
      }

      try {
        const watchList = await watchListService.deleteItemFromWatchListForUser(this.userId, this.watchList.id, itemId);

        ArrayUtilities.removeWhere(this.chartDatas ?? [], item => item.id === itemId);
        this.itemTimeseries.delete(itemId);
        this.watchList = watchList;
      } catch (error) {
        loggerService.error(error);
      }
    },

    async addSelectedItemToWatchList(): Promise<void> {
      if (this.selectedItemId === null || !this.watchList) {
        loggerService.error('No selected item!');
        return;
      }

      try {
        const watchList = await watchListService.addItemToWatchListForUser(this.userId, this.watchList.id, {
          id: this.selectedItemId
        });

        this.watchList = watchList;

        const item = watchList.watchedItems.find(i => i.id === this.selectedItemId);

        if (!item) {
          loggerService.error(`No item with id ${this.selectedItemId} on watch list.`);
          return;
        }

        const monthAgo = new Date();
        monthAgo.setDate(new Date().getDate() - 30);

        this.wowItems.set(item.id, item);
        const timeseries = await auctionTimeSeriesService.getAuctionTimeSeries(
          {
            wowItemId: item.id,
            connectedRealmId: watchList.connectedRealmId,
            startDate: monthAgo.toISOString().split('T')[0]
          },
          {
            orderBy: 'timestamp',
            comparer: Comparer.dateAscending
          }
        );

        this.itemTimeseries.set(item.id, timeseries);
        this.chartDatas?.push(this.getChartDatas(this.getTimeAgo(this.timeFrame), [[item.id, timeseries]])[0]);
        ArrayUtilities.orderBy(this.chartDatas ?? [], { orderBy: 'name' });
      } catch (error) {
        loggerService.error(error);
      } finally {
        this.selectedItemId = null;
      }
    },

    async searchItems(searchTerm: string): Promise<void> {
      this.itemsLoading = true;

      try {
        this.items = await wowItemService.getItems({ nameLike: searchTerm, first: 25 }, { orderBy: 'name' });
      } catch (error) {
        console.error(error);
      } finally {
        this.itemsLoading = false;
      }
    },

    // Must use 'function' syntax for correct 'this' binding
    debouncedSearchItems: debounce(function (
      this: Vue & { searchItems(searchTerm: string): Promise<void> },
      newValue: string
    ): void {
      this.searchItems(newValue);
    },
    500)
  },

  watch: {
    itemsSearchTerm(newValue: string | null): void {
      if (!newValue) {
        return;
      }

      this.debouncedSearchItems(newValue);
    }
  },

  async mounted(): Promise<void> {
    this.pageLoadingSubscription = loadingService.loadingStateChanged.subscribe(
      loading => (this.pageLoading = loading)
    );
    loadingService.startLoading();

    try {
      const watchList = await watchListService.getWatchListForUser(this.userId, Number(this.id));

      if (!watchList) {
        loggerService.warn(`No watch list found with id ${this.id} for user ${this.userId}`);
        this.$router.push({ name: RouteName.NotFound });
        return;
      }

      const connectedRealm = await realmService.getConnectedRealm(watchList.connectedRealmId);

      if (!connectedRealm) {
        loggerService.warn(
          `No connected realm found for watch list ${watchList.id} using connected realm id of ${watchList.connectedRealmId}.`
        );
      } else {
        this.watchListConnectedRealm = connectedRealm;
      }

      this.watchList = watchList;
      ArrayUtilities.orderBy(this.watchList.watchedItems, { orderBy: 'name' });

      const timeSeriesPromises = new Map<number, Promise<AuctionTimeSeriesEntry[]>>();

      const monthAgo = new Date();
      monthAgo.setMonth(new Date().getMonth() - 1);

      for (const item of watchList.watchedItems) {
        this.wowItems.set(item.id, item);
        timeSeriesPromises.set(
          item.id,
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

      for (const [key, value] of timeSeriesPromises.entries()) {
        try {
          const timeseries = await value;
          this.itemTimeseries.set(key, timeseries);
        } catch (error) {
          loggerService.error(`Unable to get timeseries for ${key}`, error);
        }
      }

      this.useWeekTimeRange();
    } catch (error) {
      loggerService.error(error);
    } finally {
      loadingService.stopLoading();
    }
  },

  beforeDestroy(): void {
    this.pageLoadingSubscription.unsubscribe();
  }
});
</script>
