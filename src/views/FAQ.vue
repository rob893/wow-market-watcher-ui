<template>
  <div>
    <v-card>
      <v-card-title class="text-h3">FAQ</v-card-title>

      <v-card-title>What is this site?</v-card-title>
      <v-card-text>
        This site is an application that tracks World of Warcraft auction house data over time and allows users to
        create watch lists for their favorite realms and items.
      </v-card-text>

      <v-card-title>What does 'Not enough data yet for this item. Please check back later!' message mean?</v-card-title>
      <v-card-text>
        Due to the large amount of data in the auction house and the fact that there are many different auction houses,
        we only automatically collect data on commonly requested items (such as trade materials). This message means
        that we have not collected enough data for that item for that realm. However, once added to a watch list, the
        system will begin to collect data on that item for that realm.
      </v-card-text>

      <v-card-title>What items will always have their data collected for all realms?</v-card-title>
      <v-card-text>
        We currently always collect data for tradeskill materials for the following subclasses: cooking, herb, leather,
        metal and stone, and enchanting. Data for these items will be collected for all realms.
      </v-card-text>

      <v-card-title>How often is data collected?</v-card-title>
      <v-card-text>We currently collect auction data every four hours.</v-card-text>
    </v-card>
  </div>
</template>
