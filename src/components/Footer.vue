<template>
  <v-footer absolute padless app>
    <v-card flat tile width="100%">
      <v-card-text>
        <v-row>
          <v-col cols="4">
            <h3>About</h3>
            <ul class="footer-list">
              <li><router-link to="/privacy">Privacy</router-link></li>
              <li><router-link to="/faq">FAQ</router-link></li>
            </ul>
          </v-col>

          <v-col cols="4">
            <h3>Contact</h3>
            <ul class="footer-list">
              <li><strong>Email:</strong> <a href="mailto:nyi@example.com">nyi@example.com</a></li>
            </ul>
          </v-col>

          <v-col cols="4">
            World of Warcraft, Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard
            Entertainment, Inc. in the U.S. and/or other countries.
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class="text-center">&copy; {{ new Date().getFullYear() }}</v-card-text>
    </v-card>
  </v-footer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Footer'
});
</script>

<style scoped>
.footer-list {
  list-style: none;
  padding-left: 0;
}
</style>
