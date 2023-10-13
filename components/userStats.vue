<script setup lang="ts">
import { useUser } from '@/stores/user'
import Song from '@/components/song.vue'
import {Song as SongType} from '@/types/song'
import handleFetch from '@/services/api';

defineProps<{ lastSync: string }>();
const store = useUser()
const songs = ref()
const user = ref()

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
    handleFetch('http://localhost:8000/me', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${store.user.accessToken}`
        },
        body: JSON.stringify({access_token: store.user.accessToken})
    })
  .then((response) => {
    if (!response.ok) {
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
    images: response.album.images.map((image: any) => image.url),
  };
}


onMounted(()=>{
    getMostListenedSongs()
    getUser()
})
</script>
<template>
    <div>
      <div class="header">
        <v-img class="img" v-if="user" :src="user.images[1].url"/>
        <h1 v-if="user" class="header__user-name">{{ user.display_name  }}</h1>
        </div>
        <h2 class="header__top-tracks">Top tracks this month</h2>
        <Song v-for="song in songs" :song="trackToSong(song)" />
        <h3 v-if="lastSync">Last sync: {{ lastSync }}</h3>
    </div>
</template>
<style lang="scss">
.img{
  margin-top: 5px;
    margin-bottom: 5px;
    max-width: 120px;
    max-height: 120px;
    border-radius: 68px;
}
.header{
  display:flex;
  align-items:center;
  &__user-name{
    margin-left:25px;
    font-size: 45px;
    font-weight: bold;
  }
  &__top-tracks{
    font-weight: 600;
    font-size: 25px;
  }
}
</style>