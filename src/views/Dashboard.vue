<template>
  <div class="about">
    <h1>This is the Dashboard</h1>
    <input v-model="status" type="number" />
    <input v-model="statusAfter" type="number" />
    <input v-model="delay" type="number" />
    <input v-model="per" type="number" />
    <button @click="test()">Test</button>
    <button @click="getUsers()">Test Get Users</button>
    <test-chart></test-chart>
  </div>
</template>

<script lang="ts">
import { userService } from '@/services';
import TestChart from '@/components/charts/TestChart.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'Dashboard',

  components: {
    TestChart
  },

  data: () => ({
    status: 500,
    statusAfter: 200,
    delay: 0,
    per: 0
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
