<template>
  <v-container fluid>
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelDeleteStagedWatchList">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="deleteStagedWatchList">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>My Watch Lists</v-card-title>
          <v-card-actions>
            <v-dialog v-model="createNew.showDialog" persistent max-width="600px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark v-bind="attrs" v-on="on"> Create New </v-btn>
              </template>
              <v-card>
                <v-form ref="createWatchListForm" v-model="createNew.formValid" @submit.prevent="createWatchList">
                  <v-card-title>
                    <span class="headline">Create New Watch List</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            label="Name*"
                            :rules="createNew.nameRules"
                            v-model="createNew.watchListToCreate.name"
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12">
                          <v-textarea
                            label="Description"
                            v-model="createNew.watchListToCreate.description"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-container>
                    <small>*indicates required field</small>
                  </v-card-text>

                  <v-card-actions v-if="createNew.loading" class="justify-center">
                    <v-progress-circular indeterminate color="primary" />
                  </v-card-actions>

                  <v-card-actions v-else>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue darken-1"
                      text
                      @click="
                        createNew.showDialog = false;
                        resetCreateWatchListForm();
                      "
                    >
                      Close
                    </v-btn>
                    <v-btn color="blue darken-1" text type="submit" :disabled="!createNew.formValid"> Create </v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col v-for="list in watchLists" :key="list.id" cols="12" lg="6">
        <v-card>
          <v-card-title>{{ list.name }}</v-card-title>
          <v-card-text>{{ list.description }}</v-card-text>
          <v-card-actions>
            <v-btn @click="goToWatchList(list.id)">Details</v-btn>
            <v-btn
              color="error"
              @click="
                stagedWatchListToDelete = list;
                showDeleteDialog = true;
              "
              >Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { UserMixin } from '@/mixins/UserMixin';
import { CreateWatchListForUserRequest, User, WatchList } from '@/models';
import { RouteName } from '@/router/RouteName';
import { watchListService } from '@/services';
import { Utilities } from '@/utilities';

export default (Vue as VueConstructor<Vue & InstanceType<typeof UserMixin>>).extend({
  name: 'WatchLists',

  mixins: [UserMixin],

  data: () => ({
    user: {} as User,
    watchLists: [] as WatchList[],
    showDeleteDialog: false,
    stagedWatchListToDelete: null as WatchList | null,
    createNew: {
      loading: false,
      formValid: false,
      showDialog: false,
      nameRules: [(name: string) => !!name || 'Name is required'],
      watchListToCreate: {} as CreateWatchListForUserRequest
    }
  }),

  methods: {
    goToWatchList(watchListId: number): void {
      this.$router.push({ name: RouteName.WatchList, params: { id: watchListId.toString() } });
    },

    cancelDeleteStagedWatchList(): void {
      this.showDeleteDialog = false;
      this.stagedWatchListToDelete = null;
    },

    async deleteStagedWatchList(): Promise<void> {
      if (!this.stagedWatchListToDelete) {
        return;
      }

      try {
        await watchListService.deleteWatchListForUser(this.userId, this.stagedWatchListToDelete.id);
        this.watchLists = this.watchLists.filter(list => list.id !== this.stagedWatchListToDelete?.id);
      } catch (error) {
        console.error(error);
      } finally {
        this.stagedWatchListToDelete = null;
        this.showDeleteDialog = false;
      }
    },

    async createWatchList(): Promise<void> {
      const { watchListToCreate } = this.createNew;

      if (Utilities.isEmptyObject(watchListToCreate)) {
        return;
      }

      watchListToCreate.connectedRealmId = 76;

      try {
        this.createNew.loading = true;
        const newWatchList = await watchListService.createWatchListForUser(this.userId, watchListToCreate);
        this.watchLists.push(newWatchList);
      } catch (error) {
        console.error(error);
      } finally {
        this.createNew.loading = false;
        this.createNew.showDialog = false;
        this.resetCreateWatchListForm();
      }
    },

    resetCreateWatchListForm(): void {
      (this.$refs.createWatchListForm as any).reset();
    }
  },

  async mounted(): Promise<void> {
    const watchLists = await watchListService.getWatchListsForUser(this.userId);

    this.watchLists = watchLists;
  }
});
</script>
