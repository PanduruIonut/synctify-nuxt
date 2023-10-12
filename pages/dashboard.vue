<template>
  <div>
    <h1>Welcome to your profile!</h1>
    <v-btn @click="sync">Sync your liked songs </v-btn>
    <Songs :songs="songs" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Songs from '@/components/songs.vue';
import { useUser } from "@/stores/user";
import { toast } from "vue3-toastify";

const songs = ref([]);

const store = useUser();

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
async function fetchSongs() {
  try {
    const response = await fetch('http://localhost:8000/user/liked_songs/11wtf2500ct465duqzc7kgxcq', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liked songs. Status: ${response.status}`);
    }

    songs.value = await response.json();
    console.log(songs)
  } catch (error) {
    console.error(error);
  }
}

onMounted(fetchSongs);
</script>
