<template>
  <div>
    <h1>Watch Lists</h1>
  </div>
</template>

<script lang="ts">
import { WatchList } from '@/models';
import { authService, watchListService } from '@/services';
import Vue from 'vue';

export default Vue.extend({
  name: 'WatchLists',

  data: () => ({
    watchLists: [] as WatchList[]
  }),

  async mounted(): Promise<void> {
    const userId = authService.loggedInUser?.id ?? 0;

    const watchLists = await watchListService.getWatchListsForUser(userId);

    this.watchLists = watchLists;
  }
});
</script>
