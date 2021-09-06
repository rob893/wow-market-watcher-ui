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

    <v-dialog v-model="editWatchList.showDialog" persistent max-width="600px">
      <v-card>
        <v-form ref="editWatchListForm" v-model="editWatchList.formValid" @submit.prevent="saveEditWatchList">
          <v-card-title>
            <span class="headline">Edit Watch List</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    label="Name"
                    :rules="watchListCommon.nameRules"
                    v-model="editWatchList.watchListToEdit.name.value"
                    @input="editWatchList.watchListToEdit.name.edited = true"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    label="Description"
                    v-model="editWatchList.watchListToEdit.description.value"
                    @input="editWatchList.watchListToEdit.description.edited = true"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions v-if="editWatchList.loading" class="justify-center">
            <v-progress-circular indeterminate color="primary" />
          </v-card-actions>

          <v-card-actions v-else>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeEditWatchListDialog">Close</v-btn>
            <v-btn color="blue darken-1" text type="submit" :disabled="Object.keys(editedWatchListValues).length === 0"
              >Save</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-row v-if="!pageLoading">
      <v-col cols="12">
        <v-card>
          <v-card-title>My Watch Lists</v-card-title>
          <v-card-actions>
            <v-dialog v-model="createNewWatchList.showDialog" persistent max-width="600px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="success" dark v-bind="attrs" v-on="on"
                  ><v-icon left> mdi-plus </v-icon> Create New
                </v-btn>
              </template>
              <v-card>
                <v-form
                  ref="createWatchListForm"
                  v-model="createNewWatchList.formValid"
                  @submit.prevent="createWatchList"
                >
                  <v-card-title>
                    <span class="headline">Create New Watch List</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            label="Name*"
                            :rules="watchListCommon.nameRules"
                            v-model="createNewWatchList.watchListToCreate.name"
                            required
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12">
                          <v-textarea
                            label="Description"
                            v-model="createNewWatchList.watchListToCreate.description"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-container>
                    <small>*indicates required field</small>
                  </v-card-text>

                  <v-card-actions v-if="createNewWatchList.loading" class="justify-center">
                    <v-progress-circular indeterminate color="primary" />
                  </v-card-actions>

                  <v-card-actions v-else>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue darken-1"
                      text
                      @click="
                        createNewWatchList.showDialog = false;
                        resetCreateWatchListForm();
                      "
                    >
                      Close
                    </v-btn>
                    <v-btn color="blue darken-1" text type="submit" :disabled="!createNewWatchList.formValid">
                      Create
                    </v-btn>
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
          <v-card-text>
            {{ list.description }}
          </v-card-text>
          <v-card-actions>
            <v-btn color="accent" @click="goToWatchList(list.id)"><v-icon left> mdi-view-list </v-icon>View</v-btn>
            <v-btn color="primary" @click="stageEditWatchList(list)"><v-icon left> mdi-pencil </v-icon>Edit</v-btn>
            <v-btn
              color="error"
              @click="
                stagedWatchListToDelete = list;
                showDeleteDialog = true;
              "
              ><v-icon left> mdi-delete </v-icon>Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-else>
      <v-skeleton-loader v-for="n in 3" :key="n" type="card" v-bind:class="n != 3 ? 'mb-6' : ''" elevation="2" />
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { UserMixin } from '@/mixins/UserMixin';
import { CreateWatchListForUserRequest, EditFormField, Indexable, UpdateWatchListRequest, WatchList } from '@/models';
import { RouteName } from '@/router/RouteName';
import { loadingService, loggerService, watchListService } from '@/services';
import { Utilities } from '@/utilities';
import { Subscription } from 'rxjs';

export default (Vue as VueConstructor<Vue & InstanceType<typeof UserMixin>>).extend({
  name: 'WatchLists',

  mixins: [UserMixin],

  data: () => ({
    pageLoading: false,
    loadingSubscription: new Subscription(),
    watchLists: [] as WatchList[],
    showDeleteDialog: false,
    stagedWatchListToDelete: null as WatchList | null,
    watchListCommon: {
      nameRules: [(name: string) => !!name || 'Name is required']
    },
    createNewWatchList: {
      loading: false,
      formValid: false,
      showDialog: false,
      watchListToCreate: {} as CreateWatchListForUserRequest
    },
    editWatchList: {
      stagedWatchList: null as null | WatchList,
      watchListToEdit: {
        name: { edited: false, value: '' },
        description: { edited: false, value: '' }
      } as { [key in keyof Required<UpdateWatchListRequest>]: EditFormField<string> },
      loading: false,
      formValid: false,
      showDialog: false,
      watchListIndex: NaN
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
      const { watchListToCreate } = this.createNewWatchList;

      if (Utilities.isEmptyObject(watchListToCreate)) {
        loggerService.warn(`watchListToCreate is empty ${watchListToCreate}`);
        return;
      }

      try {
        this.createNewWatchList.loading = true;
        const newWatchList = await watchListService.createWatchListForUser(this.userId, watchListToCreate);
        this.watchLists.push(newWatchList);
      } catch (error) {
        console.error(error);
      } finally {
        this.createNewWatchList.loading = false;
        this.createNewWatchList.showDialog = false;
        this.resetCreateWatchListForm();
      }
    },

    stageEditWatchList(watchList: WatchList): void {
      this.editWatchList.watchListIndex = this.watchLists.indexOf(watchList);

      Object.keys(this.editWatchList.watchListToEdit).forEach(key => {
        this.editWatchList.watchListToEdit[key] = {
          edited: false,
          value: (watchList as Indexable)[key]
        };
      });
      this.editWatchList.stagedWatchList = watchList;
      this.editWatchList.showDialog = true;
    },

    async saveEditWatchList(): Promise<void> {
      const { watchLists } = this;
      const { stagedWatchList, watchListToEdit, watchListIndex } = this.editWatchList;
      if (!watchListToEdit || !stagedWatchList) {
        // this.errorMessage = 'No budget staged for editing.';
        loggerService.error('No watch list staged for editing.');
        this.closeEditWatchListDialog();
        return;
      }

      if (Utilities.isEmptyObject(this.editedWatchListValues)) {
        this.closeEditWatchListDialog();
        return;
      }

      this.editWatchList.loading = true;

      try {
        const updatedWatchList = await watchListService.updateWatchListForUser(
          this.userId,
          stagedWatchList.id,
          this.editedWatchListValues
        );
        watchLists.splice(watchListIndex, 1, { ...stagedWatchList, ...updatedWatchList });
      } catch (error) {
        // this.errorMessage = `Unable to update budget: ${error.message}`;
        loggerService.error(`Unable to update watch list: ${(error as any).message}`);
      } finally {
        this.closeEditWatchListDialog();
        this.editWatchList.loading = false;
      }
    },

    closeEditWatchListDialog(): void {
      this.editWatchList.stagedWatchList = null;
      this.editWatchList.watchListIndex = NaN;
      this.editWatchList.showDialog = false;
      Object.keys(this.editWatchList.watchListToEdit).forEach(key => {
        this.editWatchList.watchListToEdit[key] = {
          edited: false,
          value: ''
        };
      });
      this.resetEditWatchListForm();
    },

    resetCreateWatchListForm(): void {
      (this.$refs.createWatchListForm as any).reset();
    },

    resetEditWatchListForm(): void {
      (this.$refs.editWatchListForm as any).reset();
    }
  },

  computed: {
    editedWatchListValues(): UpdateWatchListRequest {
      return Object.entries(this.editWatchList.watchListToEdit)
        .filter(([, value]) => value && value.edited)
        .reduce((prev, [key, { value }]) => ({ ...prev, [key]: value }), {});
    }
  },

  async mounted(): Promise<void> {
    this.loadingSubscription = loadingService.loadingStateChanged.subscribe(loading => (this.pageLoading = loading));
    loadingService.startLoading();

    const watchLists = await watchListService.getWatchListsForUser(this.userId);

    this.watchLists = watchLists;

    loadingService.stopLoading();
  },

  beforeDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }
});
</script>
