<template>
  <v-app>
    <Header />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <Footer />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

export default Vue.extend({
  name: 'App',

  components: {
    Header,
    Footer
  }
});
</script>
