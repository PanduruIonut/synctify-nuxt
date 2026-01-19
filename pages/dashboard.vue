<template>
  <div class="container-full-width">
    <v-row>
      <v-col cols="3">
        <UserStatsSkeleton v-if="showUserStatsSkeleton" />
        <UserStats v-if="!showUserStatsSkeleton" @show-skeleton="displayUserSkeleton()" />
        <div class="sync-settings" v-if="!showUserStatsSkeleton">
          <v-btn @click="sync">Sync</v-btn>
        </div>
      </v-col>
      <v-col cols="9">
        <div class="search-container">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search songs, artists, albums..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            class="search-input"
            @click:clear="searchQuery = ''"
          />
          <span v-if="searchQuery" class="search-results-count">
            {{ filteredSongs.length }} results
          </span>
        </div>
        <div class="songs">
          <v-skeleton-loader type="table" height="670" v-if="displayedSongs.length == 0 && !searchQuery" elevation="12" />
          <div v-else-if="displayedSongs.length == 0 && searchQuery" class="no-results">
            No songs found matching "{{ searchQuery }}"
          </div>
          <Songs v-else :songs="displayedSongs" :total-songs="filteredSongs.length" @setItemsPerPage="handleItemsPerPageChange"
            :items-per-page="itemsPerPage" />
        </div>
        <div class="pagination" v-if="totalPages > 1">
          <v-btn @click="previousPage" :disabled="currentPage === 1">←</v-btn>
          <span class="current-page">{{ currentPage }} / {{ totalPages }}</span>
          <v-btn @click="nextPage" :disabled="currentPage === totalPages">→</v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Songs from '@/components/songs.vue';
import { useUser } from "@/stores/user";
import { toast } from "vue3-toastify";
import handleFetch from '@/services/api';
import formatDateTime from '@/utils/datetime';


const songs = ref([]);
const displayedSongs = ref([]);
const searchQuery = ref('');
const store = useUser();
const itemsPerPage = ref(10);
const currentPage = ref(1);
const totalPages = ref(1);
const showUserStatsSkeleton = ref(true);
const runtimeConfig = useRuntimeConfig();

const filteredSongs = computed(() => {
  if (!searchQuery.value.trim()) {
    return songs.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return songs.value.filter((song: any) => {
    const title = (song.title || '').toLowerCase();
    const artists = (song.artists || '').toLowerCase();
    const album = (song.album || '').toLowerCase();

    return title.includes(query) || artists.includes(query) || album.includes(query);
  });
});

async function fetchSongs() {
  if (!store || !store.user || !store.user.id) { return }
  try {
    const response = await handleFetch(`${runtimeConfig.public.API_BASE_URL}/api/user/get_liked_songs/${store.user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liked songs. Status: ${response.status}`);
    }

    const res = await response.json();
    songs.value = res.liked_songs
    store.user.lastSync = formatDateTime(res.last_sync)
    updateDisplayedSongs();
  } catch (error) {
    console.error(error);
  }
}
const syncPlaylist = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await handleFetch(`${runtimeConfig.public.API_BASE_URL}/api/create_playlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: store.user.accessToken, refresh_token: store.user.refreshToken, expires_in: store.user.tokenExpiry }),
      });

      if (!response.ok) {
        reject(
          new Error(`Failed to create playlist. Status: ${response.status}`)
        );
        return;
      } else {
        fetchSongs()
      }

      const data = await response
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

const sync = () => {
  toast.promise(
    syncPlaylist,
    {
      pending: "Synchronizing your liked songs ⏳︎",
      success: "Your playlist is being synchronized 👌",
      error: "Error while synchronizing 🤯",
    },
    {
      position: toast.POSITION.TOP_CENTER,
    }
  );
};

function updateDisplayedSongs() {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  displayedSongs.value = filteredSongs.value.slice(startIndex, endIndex);
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    updateDisplayedSongs();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    updateDisplayedSongs();
  }
}

const handleItemsPerPageChange = (newItemsPerPage: number) => {
  itemsPerPage.value = newItemsPerPage;
  updateDisplayedSongs();
};

// Watch filtered songs to update pagination
watch(filteredSongs, () => {
  totalPages.value = Math.ceil(filteredSongs.value.length / itemsPerPage.value) || 1;
  // Reset to page 1 when search changes
  if (currentPage.value > totalPages.value) {
    currentPage.value = 1;
  }
  updateDisplayedSongs();
});

// Reset to page 1 when search query changes
watch(searchQuery, () => {
  currentPage.value = 1;
});

const onUserIdChanged = (newUserId, oldUserId) => {
  if (newUserId) {
    fetchSongs()
  }
}

const fetchSongsNow = (status:boolean, oldStatus:boolean) => {
  if (status) {
    fetchSongs().then(()=>{
      store.user.fetchSongsNow = false;

    })

  }
}
const displayUserSkeleton = () => {
  showUserStatsSkeleton.value = true;
}
watch(() => store.user.id, onUserIdChanged)

watch(() => store.user.fetchSongsNow, fetchSongsNow)

watchEffect(() => {
  setTimeout(() => {
    showUserStatsSkeleton.value = false;
  }, 100);
});

onMounted(() => {
  fetchSongs();
});
</script>
<style lang="scss">
@import '~/assets/css/main.scss';

body {
  background-color: $codGray;
  color: white;
}

.container-full-width {
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 2%;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.search-input {
  max-width: 400px;

  .v-field {
    background-color: $nero;
    border-radius: 8px;
  }

  .v-field__input {
    color: white;
  }

  .v-icon {
    color: #888;
  }
}

.search-results-count {
  color: #888;
  font-size: 14px;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #888;
  font-size: 16px;
  background-color: $nero;
  border-radius: 10px;
}

.pagination {
  margin-top: 15px;
  text-align: center;
}

.current-page {
  margin-left: 10px;
  margin-right: 10px;
}

.songs {
  flex-direction: column;
  display: flex;
  max-height: 670px;
  overflow: auto;
  border-radius: 10px;
  box-shadow: 4px 4px 16px 1px rgba(0, 0, 0, 0.75);
}

.v-btn {
  background-color: $nero !important;
}

.v-btn:hover {
  background-color: $eclipse !important;
}

.v-btn__overlay {
  background-color: transparent !important;
}

.sync-settings {
  border-radius: 10px;
  margin-top: 17px;
  background-color: $nero;
  box-shadow: 4px 4px 16px 1px rgba(0, 0, 0, 0.75);
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 90%, $nero);
  background: linear-gradient(to bottom, $nero 90%, rgba(0, 0, 0, 0));
}
</style>
