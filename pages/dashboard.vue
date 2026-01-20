<template>
  <div class="dashboard-container">
    <div class="left-panel">
      <UserStatsSkeleton v-if="showUserStatsSkeleton" />
      <UserStats v-if="!showUserStatsSkeleton" @show-skeleton="displayUserSkeleton()" />
      <div class="sync-settings" v-if="!showUserStatsSkeleton">
        <v-btn @click="sync">Sync Liked Songs</v-btn>
      </div>
      <Playlists v-if="!showUserStatsSkeleton" @selectPlaylist="handleSelectPlaylist" />
    </div>
    <div class="right-panel">
      <!-- Breadcrumb / Context indicator -->
      <div class="context-header">
        <div class="context-info">
          <span 
            class="context-item" 
            :class="{ active: !selectedPlaylist, clickable: selectedPlaylist }"
            @click="backToLikedSongs"
          >
            Liked Songs
          </span>
          <template v-if="selectedPlaylist">
            <span class="context-separator">›</span>
            <span class="context-item active">{{ selectedPlaylist.name }}</span>
          </template>
        </div>
        <v-btn 
          v-if="selectedPlaylist" 
          size="small" 
          @click="backToLikedSongs"
          class="back-btn"
        >
          ← Back to Liked Songs
        </v-btn>
      </div>

      <div class="search-container">
        <v-text-field
          v-model="searchQuery"
          :placeholder="selectedPlaylist ? `Search in ${selectedPlaylist.name}...` : 'Search songs, artists, albums...'"
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
      <div class="songs-wrapper">
        <div class="songs">
          <v-skeleton-loader type="table" v-if="displayedSongs.length == 0 && !searchQuery && loadingSongs" elevation="12" />
          <div v-else-if="displayedSongs.length == 0 && searchQuery" class="no-results">
            No songs found matching "{{ searchQuery }}"
          </div>
          <div v-else-if="displayedSongs.length == 0 && !loadingSongs" class="no-results">
            {{ selectedPlaylist ? 'This playlist is empty' : 'No liked songs found' }}
          </div>
          <Songs v-else :songs="displayedSongs" :total-songs="filteredSongs.length" @setItemsPerPage="handleItemsPerPageChange"
            :items-per-page="itemsPerPage" />
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1">
        <v-btn @click="previousPage" :disabled="currentPage === 1">←</v-btn>
        <span class="current-page">{{ currentPage }} / {{ totalPages }}</span>
        <v-btn @click="nextPage" :disabled="currentPage === totalPages">→</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Songs from '@/components/songs.vue';
import Playlists from '@/components/Playlists.vue';
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
const selectedPlaylist = ref<any>(null);
const loadingSongs = ref(true);

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

async function fetchLikedSongs() {
  if (!store || !store.user || !store.user.id) { return }
  loadingSongs.value = true;
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
  } finally {
    loadingSongs.value = false;
  }
}

async function fetchPlaylistSongs(playlistId: number) {
  if (!store || !store.user || !store.user.id) { return }
  loadingSongs.value = true;
  try {
    const response = await handleFetch(
      `${runtimeConfig.public.API_BASE_URL}/api/user/${store.user.id}/playlist/${playlistId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist songs. Status: ${response.status}`);
    }

    const res = await response.json();
    songs.value = res.songs || [];
    updateDisplayedSongs();
  } catch (error) {
    console.error(error);
  } finally {
    loadingSongs.value = false;
  }
}

function handleSelectPlaylist(playlist: any) {
  selectedPlaylist.value = playlist;
  searchQuery.value = '';
  currentPage.value = 1;
  fetchPlaylistSongs(playlist.id);
  document.querySelector('.songs')?.scrollTo(0, 0);
}

function backToLikedSongs() {
  if (!selectedPlaylist.value) return;
  selectedPlaylist.value = null;
  searchQuery.value = '';
  currentPage.value = 1;
  fetchLikedSongs();
  document.querySelector('.songs')?.scrollTo(0, 0);
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
        fetchLikedSongs()
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
    fetchLikedSongs()
  }
}

const fetchSongsNow = (status:boolean, oldStatus:boolean) => {
  if (status) {
    fetchLikedSongs().then(()=>{
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
  fetchLikedSongs();
  document.querySelector('.songs')?.scrollTo(0, 0);
});
</script>
<style lang="scss">
@import '~/assets/css/main.scss';

body {
  background-color: $codGray;
  color: white;
  margin: 0;
  overflow: hidden;
}

.dashboard-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
}

.left-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.context-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.context-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.context-item {
  font-size: 14px;
  color: #b3b3b3;
  transition: color 0.2s;

  &.clickable {
    cursor: pointer;
    
    &:hover {
      color: white;
    }
  }

  &.active {
    color: white;
    font-weight: 600;
  }
}

.context-separator {
  color: #666;
  font-size: 14px;
}

.back-btn {
  background-color: transparent !important;
  border: 1px solid #b3b3b3 !important;
  color: #b3b3b3 !important;
  font-size: 12px !important;

  &:hover {
    border-color: white !important;
    color: white !important;
  }
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  flex-shrink: 0;
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

.songs-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.songs {
  height: 100%;
  overflow: auto;
  border-radius: 10px;
  box-shadow: 4px 4px 16px 1px rgba(0, 0, 0, 0.75);
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
  flex-shrink: 0;
}

.current-page {
  margin-left: 10px;
  margin-right: 10px;
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
  flex-shrink: 0;
}
</style>
