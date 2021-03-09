<template>
  <div class="about">
    <h1>This is the Dashboard</h1>
    <input v-model="status" type="number" />
    <input v-model="statusAfter" type="number" />
    <input v-model="delay" type="number" />
    <input v-model="per" type="number" />
    <button @click="test()">Test</button>
    <button @click="getUsers()">Test Get Users</button>
    <line-chart :chartData="chartData"></line-chart>
    <line-chart :chartData="chartData"></line-chart>
    <line-chart :chartData="chartData"></line-chart>
  </div>
</template>

<script lang="ts">
import { userService } from '@/services';
import LineChart from '@/components/charts/LineChart.vue';
import Vue from 'vue';
import { ChartData } from 'node_modules/@types/chart.js';
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
    } as ChartData
  }),

  methods: {
    async test(): Promise<void> {
      await userService.test(this.status, this.delay, this.statusAfter, this.per);
    },

    async getUsers(): Promise<void> {
      const users = await userService.getUsers();
      console.log(users);
    }
  }
});
</script>
