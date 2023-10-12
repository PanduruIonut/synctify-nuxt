<script setup lang="ts">
import { ref } from "vue";
import Song from "@/components/song.vue";
import { PlayStates } from "@/types/playStates";

let songs = ref();
let isPlaying = ref(false);

const audioPlayer = ref<HTMLElement | null>(null);
const playStates = ref<PlayStates>({});
const showPlayButtonForSong = ref<string | null>(null);

const togglePlay = (audioUrl: string, song: typeof Song): void => {
  audioPlayer.value = document.getElementById("player");

  if (audioPlayer.value) {
    if (!isPlaying.value) {
      (audioPlayer.value as HTMLAudioElement).src = audioUrl;
      (audioPlayer.value as HTMLAudioElement).play();
      playStates.value[song.id] = true;
      showPlayButtonForSong.value = song.id;
    } else {
      (audioPlayer.value as HTMLAudioElement).pause();

      playStates.value[song.id] = false;
      showPlayButtonForSong.value = null;
    }
    isPlaying.value = !isPlaying.value;
  }
};

onMounted(async () => {
  audioPlayer.value = document.getElementById("player");

  const response = await fetch(
    `http://localhost:8000/user/liked_songs/${"11wtf2500ct465duqzc7kgxcq"}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    new Error(`Failed to create playlist. Status: ${response.status}`);
    return;
  }

  songs.value = await response.json();
});
const formatTimestamp = (addedAt: string) => {
  const currentDate = new Date();
  const songAddedDate = new Date(addedAt);
  const timeDifference: number =
    currentDate.getTime() - songAddedDate.getTime();

  if (timeDifference >= 30 * 24 * 60 * 60 * 1000) {
    return addedAt;
  } else if (timeDifference >= 7 * 24 * 60 * 60 * 1000) {
    const weeksAgo = Math.floor(timeDifference / (7 * 24 * 60 * 60 * 1000));
    return `${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`;
  } else if (timeDifference >= 24 * 60 * 60 * 1000) {
    const daysAgo = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  } else {
    const minutesAgo = Math.floor(timeDifference / (60 * 1000));
    return `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
  }
};
</script>
<template>
  <div v-if="songs">
    <v-table fixed-header class="songs">
      <thead>
        <tr>
          <th class="text-left">#</th>
          <th class="text-left">Title</th>
          <th class="text-left">Album</th>
          <th class="text-left">Date added</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="song in songs.slice(0, 100)" :key="song.title" @mouseenter="showPlayButtonForSong = song.id"
          @mouseleave="showPlayButtonForSong = null" @click="togglePlay(song.preview_url, song)">
          <td>
            <span v-if="showPlayButtonForSong === song.id">
              <button v-if="!playStates[song.id]">▶︎</button>
              <button v-else>⏸︎</button>
            </span>
            <span v-else>{{ song.id }}</span>
          </td>
          <td>
            <Song :song="song" />
          </td>
          <td>{{ song.album }}</td>
          <td>{{ formatTimestamp(song.added_at) }}</td>
        </tr>
      </tbody>
    </v-table>
    <audio controls id="player"></audio>
  </div>
  <div v-else>Loading...</div>
</template>

<style lang="scss">
player{
  display: none
}
</style>