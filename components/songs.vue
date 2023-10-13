<script setup lang="ts">
import { ref } from "vue";
import Song from "@/components/song.vue";
import SongType from "@/components/songs.vue"

defineProps<{ songs: Array<typeof SongType>, totalSongs: number, itemsPerPage: number }>();


const audioPlayer = ref<HTMLElement | null>(null);
const currentSong = ref(null);
const itemsPerPage = ref(10);
const emit = defineEmits(["setItemsPerPage"])


const togglePlay = (audioUrl: string, song: typeof SongType) => {
  if (audioPlayer.value) {
    if (currentSong.value === song.id) {
      if ('paused' in audioPlayer.value && audioPlayer.value.paused) {
        audioPlayer.value.play();
      } else {
        audioPlayer.value.pause();
      }
    } else {
      audioPlayer.value.src = audioUrl;
      audioPlayer.value.play();
      currentSong.value = song.id;
    }
  }
};

onMounted(async () => {
  audioPlayer.value = document.getElementById("player");

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

const headers = [
  {
    title: '#',
    align: 'start',
    sortable: true,
    key: 'id',
  },
  { title: 'Title', key: 'title', align: 'start' },
  { title: 'Artist', key: 'artist', align: 'start' },
  { title: 'Album', key: 'album', align: 'start' },
  { title: 'Date Added', key: 'added_at', align: 'start' },
]

const loading = ref(false);


const hoveredRow = ref(null);
const selectedRow = ref(null);

const handleRowClick = (item: typeof Song) => {
  togglePlay(item.preview_url, item);
  if (selectedRow.value === item.id) {
    selectedRow.value = null;
  } else {
    if (selectedRow !== null) {
      selectedRow.value = null;
    }
    selectedRow.value = item.id;
  }
}
const handleItemsPerPageChanged = (newValue: number) => {
  emit('setItemsPerPage', newValue);
}

watch(itemsPerPage, (newValue, oldValue) => {
  console.log({ newValue })
  handleItemsPerPageChanged(newValue);
});

</script>
<template>
  <v-data-table-server :headers="headers" :items-length="totalSongs" :items="songs" :loading="loading"
    v-model:items-per-page="itemsPerPage" class="elevation-1" item-value="id">
    <template v-slot:item="{ item }">
      <tr @mouseenter="hoveredRow = item.id" @mouseleave="hoveredRow = null" @click="handleRowClick(item)"
        :class="{ 'selected-row': selectedRow === item.id }">
        <td v-html="selectedRow === item.id ? '⏸' : (hoveredRow === item.id ? '▶︎' : item.id)"></td>
        <td>
          <Song :song="item" />
        </td>
        <td>{{ item.artist }}</td>
        <td>{{ item.album }}</td>
        <td>{{ formatTimestamp(item.added_at) }}</td>
      </tr>
    </template>
  </v-data-table-server>
  <audio controls id="player"></audio>
</template>

<style lang="scss">
#player {
  display: none
}
</style>