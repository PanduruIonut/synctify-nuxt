<template>
  <div class="container-full-width">
    <v-row>
      <v-col cols="3">
        <UserStatsSkeleton v-if="showUserStatsSkeleton"/>
        <UserStats v-else :last-sync="lastSync" />
        <div class="sync-settings" v-if="!showUserStatsSkeleton">
          <v-btn @click="sync">Sync</v-btn>
        </div>
      </v-col>
      <v-col cols="9">
        <div class="songs">
          <v-skeleton-loader type="table" height="670" v-if="displayedSongs.length == 0" elevation="12"/>
          <Songs v-else :songs="displayedSongs" :total-songs="songs.length" @setItemsPerPage="handleItemsPerPageChange"
            :items-per-page="itemsPerPage" />
        </div>
        <div class="pagination">
          <v-btn @click="previousPage" :disabled="currentPage === 1">←</v-btn>
          <span class="current-page">{{ currentPage }}</span>
          <v-btn @click="nextPage" :disabled="currentPage === totalPages">→</v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Songs from '@/components/songs.vue';
import { useUser } from "@/stores/user";
import { toast } from "vue3-toastify";
import handleFetch from '@/services/api';


const songs = ref([]);
const displayedSongs = ref([]);
const store = useUser();
const itemsPerPage = ref(10);
const currentPage = ref(1);
const totalPages = ref(1);
const lastSync = ref()
const showUserStatsSkeleton = ref(true);


async function fetchSongs() {
  if(!store || !store.user || !store.user.id) { return }
  try {
    const response = await handleFetch(`http://localhost:8000/user/liked_songs/${store.user.id}`, {
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
    lastSync.value = res.last_synced
    updateDisplayedSongs();
  } catch (error) {
    console.error(error);
  }
}
const syncPlaylist = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await handleFetch("http://localhost:8000/create_playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: store.user.accessToken, refresh_token: store.user.refreshToken, expires_in: store.user.tokenExpiry}),
      });

      if (!response.ok) {
        reject(
          new Error(`Failed to create playlist. Status: ${response.status}`)
        );
        return;
      }

      const data = await response.json();
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
      success: "Playlist synchronized 👌",
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
  displayedSongs.value = songs.value.slice(startIndex, endIndex);
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

watch(songs, () => {
  totalPages.value = Math.ceil(songs.value.length / itemsPerPage.value);
});

const onUserIdChanged = (newUserId, oldUserId) => {
      if (newUserId) {
        fetchSongs()
      }
    }
watch(() => store.user.id, onUserIdChanged)

watchEffect(() => {
      setTimeout(() => {
        showUserStatsSkeleton.value = false;
      }, 100);
    });

onMounted(fetchSongs);
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

.pagination {
  margin-top: 15px;
  text-align: center;
}

.current-page{
  margin-left:5px;
  margin-right:5px;
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
.sync-settings{
  border-radius:10px;
  margin-top:17px;
  background-color: $nero;
  box-shadow: 4px 4px 16px 1px rgba(0,0,0,0.75);
  background:linear-gradient(to bottom, rgba(0,0,0,0) 90%, $nero);
  background:linear-gradient(to bottom,  $nero 90%, rgba(0,0,0,0));
}
</style>