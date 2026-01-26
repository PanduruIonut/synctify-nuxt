<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import Song from "@/components/song.vue";
import SongType from "@/components/songs.vue"
import { useSpotifyPlayer } from "@/composables/useSpotifyPlayer"

const props = defineProps<{ songs: Array<typeof SongType>, allSongs?: Array<typeof SongType>, totalSongs: number, itemsPerPage: number }>();

const {
  isReady,
  isPlaying,
  currentTrack,
  error,
  initPlayer,
  playTrack,
  togglePlay,
  disconnect
} = useSpotifyPlayer()

const itemsPerPage = ref(10);
const page = ref(1);
const emit = defineEmits(["setItemsPerPage"])

// Get all URIs from all songs for queue (not just current page)
const allUris = computed(() => {
  const songsToUse = props.allSongs || props.songs
  return songsToUse
    .filter((s: any) => s.spotify_uri)
    .map((s: any) => s.spotify_uri)
})

const handleSongClick = async (item: typeof Song) => {
  if (!item.spotify_uri) {
    console.warn('No Spotify URI for this track')
    return
  }

  if (currentTrack.value?.uri === item.spotify_uri) {
    // Same song - toggle play/pause
    await togglePlay()
  } else {
    // Different song - play it with the full queue
    await playTrack(item.spotify_uri, allUris.value)
  }

  if (selectedRow.value === item.id) {
    selectedRow.value = null;
  } else {
    selectedRow.value = item.id;
  }
}

onMounted(async () => {
  await initPlayer()
});

onUnmounted(() => {
  disconnect()
})

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
  } else if (timeDifference >= 60 * 60 * 1000) {
    const hoursAgo = Math.floor(timeDifference / (60 * 60 * 1000));
    return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
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
    width: '60px',
  },
  { title: 'Title', key: 'title', align: 'start' },
  { title: 'Artists', key: 'artists', align: 'start' },
  { title: 'Album', key: 'album', align: 'start' },
  { title: 'Date Added', key: 'added_at', align: 'start', width: '130px' },
]

const loading = ref(false);

const hoveredRow = ref(null);
const selectedRow = ref(null);

const handleItemsPerPageChanged = (newValue: number) => {
  emit('setItemsPerPage', newValue);
}

watch(itemsPerPage, (newValue, oldValue) => {
  console.log({ newValue })
  handleItemsPerPageChanged(newValue);
});

const getPlayIcon = (item: any, index: number) => {
  if (selectedRow.value === item.id) {
    return isPlaying.value && currentTrack.value?.uri === item.spotify_uri ? '▐▐' : '▶︎'
  }
  if (hoveredRow.value === item.id) {
    return '▶︎'
  }
  // Calculate row number based on page and position
  return (page.value - 1) * itemsPerPage.value + index + 1
}

const isItemPlaying = (item: any) => {
  return currentTrack.value?.uri === item.spotify_uri && isPlaying.value
}
</script>
<template>
  <div v-if="error" class="player-error">{{ error }}</div>
  <div v-if="!isReady" class="player-loading">Connecting to Spotify...</div>
  <v-data-table-server class="table" :headers="headers" :items-length="totalSongs" :items="songs" :loading="loading"
    v-model:items-per-page="itemsPerPage" v-model:page="page" item-value="id">
    <template v-slot:item="{ item, index }">
      <tr class="activeItem" @mouseenter="hoveredRow = item.id" @mouseleave="hoveredRow = null"
        @click="handleSongClick(item)" :class="{ 'selected-row': selectedRow === item.id, 'playing': isItemPlaying(item) }">
        <td style="width: 60px;" v-html="getPlayIcon(item, index)"></td>
        <td>
          <Song :song="item" :noClick="true" />
        </td>
        <td class="text-truncate" :title="item.artists">{{ item.artists }}</td>
        <td class="text-truncate" :title="item.album">{{ item.album }}</td>
        <td style="width: 130px;">{{ formatTimestamp(item.added_at) }}</td>
      </tr>
    </template>
  </v-data-table-server>
</template>

<style lang="scss">
@import '~/assets/css/main.scss';

.player-error {
  color: #ff4444;
  padding: 10px;
  margin-bottom: 10px;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 5px;
}

.player-loading {
  color: #1DB954;
  padding: 10px;
  margin-bottom: 10px;
}

.table {
  background-color: $nero;
  border-radius: 10px;
  box-shadow: -2px 10px 22px 3px rgba(0, 0, 0, 0.75);
  background: linear-gradient(to bottom, $nero 15%, rgba(0,0,0,0));
}

.text-truncate {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

tbody {
  tr:hover {
    background: $eclipse;
    transition: background 0.3s ease-in;
    border-radius: 15px;
    cursor: pointer;
    td {
      background-color: $eclipse !important;
    }
  }

  tr.playing {
    td:first-child {
      color: #1DB954;
    }
  }
}
</style>
