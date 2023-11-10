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
        <v-img class="img" v-if="user" :src="user.images[1].url"/>
        <span v-if="user" class="user-name">{{ user.display_name  }}</span>
      </div>
      <span class="top-tracks-title">Top tracks this month</span>
      <div class="top-tracks-songs">
        <Song v-for="song in songs" :song="trackToSong(song)" />
      </div>
        <span class="lastSync">Last sync: {{ lastSync }}</span>
    </div>
</template>
<style lang="scss">
@import '~/assets/css/main.scss';
.img{
  margin-top: 5px;
    margin-bottom: 5px;
    max-width: 120px;
    max-height: 120px;
    border-radius: 68px;
    box-shadow: -2px 10px 22px 3px rgba(0,0,0,0.75);
}

.profile-container{
  background-color:$nero;
  padding-top:20px;
  padding-bottom:20px;
  padding-left:25px;
  padding-right:25px;
  border-radius:10px;
  box-shadow: 4px 4px 16px 1px rgba(0,0,0,0.75);
  background:linear-gradient(to bottom, $nero 65%, rgba(0,0,0,0));
  
  
  .header{
    display:flex;
    align-items:center;
    margin-bottom:15px;
  
  .user-name{
    margin-left:25px;
    font-size: 45px;
    font-weight: bold;
  }
}
  .top-tracks-title{
    font-weight: 600;
    font-size: 25px;
  }
  .top-tracks-songs{
    margin-top:10px;
    margin-bottom:10px;
  }
}
</style>