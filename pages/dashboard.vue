<template>
  <v-container class="container">
    <v-row>
      <v-col cols="2">
        <UserStats />
        <v-btn @click="sync">Sync</v-btn>
    </v-col>
    <v-col cols="10">
      <div>
      <Songs :songs="displayedSongs" :total-songs="songs.length" @setItemsPerPage="handleItemsPerPageChange"
        :items-per-page="itemsPerPage" />
      <div class="pagination">
        <v-btn @click="previousPage" :disabled="currentPage === 1">←</v-btn>
        <span class="current-page">{{ currentPage }}</span>
        <v-btn @click="nextPage" :disabled="currentPage === totalPages">→</v-btn>
        </div>
      </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Songs from '@/components/songs.vue';
// import userStats from '@/components/userStats.vue';
import { useUser } from "@/stores/user";
import { toast } from "vue3-toastify";

const songs = ref([]);
const displayedSongs = ref([]);
const store = useUser();
const itemsPerPage = ref(10);
const currentPage = ref(1);
const totalPages = ref(1);


async function fetchSongs() {
  try {
    const response = await fetch(`http://localhost:8000/user/liked_songs/11wtf2500ct465duqzc7kgxcq`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liked songs. Status: ${response.status}`);
    }

    const allSongs = await response.json();
    songs.value = allSongs;
    updateDisplayedSongs();
  } catch (error) {
    console.error(error);
  }
}
const syncPlaylist = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("http://localhost:8000/create_playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: store.user.accessToken }),
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

onMounted(fetchSongs);
</script>
<style>
.container{
  margin-left:5px;
}
.pagination{
  margin-top:5px;
  text-align: center;
}
</style>