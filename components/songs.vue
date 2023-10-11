<script setup lang="ts">
import Song from "@/components/song.vue";
let songs = ref();
onMounted(async () => {
  const response = await fetch(
    `http://localhost:8000/user/liked_songs/${""}`,
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
  const timeDifference: number = currentDate.getTime() - songAddedDate.getTime();

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
        <tr v-for="song in songs.slice(0, 100)" :key="song.title">
          <td>{{ song.id }}</td>
          <td><Song :song="song" /></td>
          <td>{{ song.album }}</td>
          <td>{{ formatTimestamp(song.added_at) }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
  <div v-else>Loading...</div>
</template>
<style lang="scss">
</style>