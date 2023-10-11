<script setup lang="ts">
import { useUser } from "@/stores/user";
import { toast } from "vue3-toastify";
import  Songs  from '~/components/Songs.vue'
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
</script>
<template>
  <div>
    <h1>Welcome to your profile!</h1>
    <v-btn @click="sync">Sync your liked songs </v-btn>
    <Songs/>
  </div>
</template>