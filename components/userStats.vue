<script setup lang="ts">
import { useUser } from '@/stores/user'
import Song from '@/components/song.vue'
import {Song as SongType} from '@/types/song'
import handleFetch from '@/services/api';

const store = useUser()
const songs = ref()
const user = ref()
const lastSync = ref(store.user.lastSync)
const runtimeConfig = useRuntimeConfig();
const emit = defineEmits(["showSkeleton"])


async function getMostListenedSongs() {
    handleFetch('https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term', {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${store.user.accessToken}`
        },
    })
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    songs.value = data.items;
  })
  .catch((error) => {
    console.error(error);
  });
}

async function getUser(){
    handleFetch(`${runtimeConfig.public.API_BASE_URL}/api/me`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${store.user.accessToken}`
        },
        body: JSON.stringify({access_token: store.user.accessToken})
    })
  .then((response) => {
    if (!response.ok) {
      emit('showSkeleton');
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
      user.value = data;
      store.saveUser(data)
  })
  .catch((error) => {
    console.error(error);
  });
}

function trackToSong(response: any): SongType {
  return {
    id: response.id,
    title: response.name,
    artist: response.artists[0].name,
    album: response.album.name,
    preview_url: response.preview_url,
    images: JSON.stringify(response.album.images),
  };
}
watch(() => store.user.lastSync, (newLastSync, oldLastSync) => {
  lastSync.value = newLastSync
})



onMounted(()=>{
    getMostListenedSongs()
    getUser()
})
</script>
<template>
    <div class="profile-container">
      <div class="header">
        <img class="profile-img" v-if="user && user.images && user.images[1]" :src="user.images[1].url" alt="Profile"/>
        <span v-if="user" class="user-name">{{ user.display_name  }}</span>
      </div>
      <span class="top-tracks-title">Top tracks this month</span>
      <div class="top-tracks-songs">
        <div v-for="song in songs" :key="song.id" class="top-track-item">
          <Song :song="trackToSong(song)" />
        </div>
      </div>
      <span class="lastSync" v-if="lastSync">Last sync: {{ lastSync }}</span>
    </div>
</template>
<style lang="scss">
@import '~/assets/css/main.scss';

.profile-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: -2px 10px 22px 3px rgba(0,0,0,0.75);
}

.profile-container {
  background-color: $nero;
  padding: 20px 25px;
  border-radius: 10px;
  box-shadow: 4px 4px 16px 1px rgba(0,0,0,0.75);
  background: linear-gradient(to bottom, $nero 65%, rgba(0,0,0,0));

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    .user-name {
      margin-left: 25px;
      font-size: 45px;
      font-weight: bold;
    }
  }

  .top-tracks-title {
    font-weight: 600;
    font-size: 25px;
    display: block;
    margin-bottom: 10px;
  }

  .top-tracks-songs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .top-track-item {
    padding: 4px 0;
  }

  .lastSync {
    display: block;
    margin-top: 15px;
    font-size: 12px;
    color: #b3b3b3;
  }
}
</style>
