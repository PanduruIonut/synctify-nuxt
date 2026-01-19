<script setup lang="ts">
import { useUser } from '@/stores/user'
import Song from '@/components/song.vue'
import {Song as SongType} from '@/types/song'
import handleFetch from '@/services/api';

const store = useUser()
const songs = ref()
const user = ref()
const lastSync = ref(store.user.lastSync)
const runtimeConfig = useRuntimeConfig()
const emit = defineEmits(["showSkeleton"])

// Toggle state: 'top-tracks' or 'on-this-day'
const activeTab = ref('top-tracks')

// On This Day data
const onThisDayData = ref<any>(null)
const onThisDayLoading = ref(false)
const expandedYears = ref<Record<string, boolean>>({})

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

async function fetchOnThisDay() {
  if (!store.user?.id) return
  onThisDayLoading.value = true

  try {
    const response = await handleFetch(
      `${runtimeConfig.public.API_BASE_URL}/api/user/on_this_day/${store.user.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) throw new Error('Failed to fetch')

    onThisDayData.value = await response.json()

    // Expand first year by default
    if (onThisDayData.value?.songs_by_year) {
      const years = Object.keys(onThisDayData.value.songs_by_year)
      if (years.length > 0) {
        expandedYears.value[years[0]] = true
      }
    }
  } catch (e) {
    console.error('Failed to fetch on this day:', e)
  } finally {
    onThisDayLoading.value = false
  }
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

function formatOnThisDaySong(song: any) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artists?.split(',')[0] || '',
    album: song.album,
    preview_url: song.preview_url,
    images: song.images,
    spotify_uri: song.spotify_uri
  }
}

function toggleYear(year: string) {
  const isCurrentlyExpanded = expandedYears.value[year]
  // Close all years first
  Object.keys(expandedYears.value).forEach(y => {
    expandedYears.value[y] = false
  })
  // Toggle the clicked year (open if it was closed)
  if (!isCurrentlyExpanded) {
    expandedYears.value[year] = true
  }
}

watch(() => store.user.lastSync, (newLastSync) => {
  lastSync.value = newLastSync
})

watch(() => store.user?.id, (newId) => {
  if (newId && activeTab.value === 'on-this-day') {
    fetchOnThisDay()
  }
})

// Fetch on this day data when tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'on-this-day' && !onThisDayData.value) {
    fetchOnThisDay()
  }
})

onMounted(() => {
    getMostListenedSongs()
    getUser()
})
</script>
<template>
    <div class="profile-container">
      <div class="header">
        <img class="profile-img" v-if="user && user.images && user.images[0]" :src="user.images[0].url" alt="Profile"/>
        <span v-if="user" class="user-name">{{ user.display_name }}</span>
      </div>

      <!-- Toggle Tabs -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'top-tracks' }"
          @click="activeTab = 'top-tracks'"
        >
          Top Tracks
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'on-this-day' }"
          @click="activeTab = 'on-this-day'"
        >
          On This Day
        </button>
      </div>

      <!-- Top Tracks Content -->
      <div v-if="activeTab === 'top-tracks'" class="tab-content">
        <div class="top-tracks-songs">
          <div v-for="song in songs" :key="song.id" class="top-track-item">
            <Song :song="trackToSong(song)" />
          </div>
        </div>
      </div>

      <!-- On This Day Content -->
      <div v-else-if="activeTab === 'on-this-day'" class="tab-content">
        <div v-if="onThisDayLoading" class="loading">Loading memories...</div>

        <div v-else-if="onThisDayData && onThisDayData.total_count === 0" class="empty">
          No songs saved on {{ onThisDayData.date }} in previous years
        </div>

        <div v-else-if="onThisDayData" class="on-this-day-content">
          <div class="date-label">{{ onThisDayData.date }}</div>
          <div class="years-container">
            <div v-for="(yearSongs, year) in onThisDayData.songs_by_year" :key="year" class="year-section">
              <div class="year-header" @click="toggleYear(String(year))">
                <span class="year">{{ year }}</span>
                <span class="count">{{ yearSongs.length }}</span>
                <span class="chevron">{{ expandedYears[String(year)] ? '▼' : '▶' }}</span>
              </div>
              <div v-if="expandedYears[String(year)]" class="songs-list">
                <div v-for="song in yearSongs" :key="song.id" class="song-item">
                  <Song :song="formatOnThisDaySong(song)" />
                </div>
              </div>
            </div>
          </div>
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

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
  }

  .tab {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    color: #b3b3b3;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    &.active {
      background: #1DB954;
      color: black;
    }
  }

  .tab-content {
    min-height: 200px;
  }

  .top-tracks-songs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .top-track-item {
    padding: 4px 0;
  }

  .loading,
  .empty {
    color: #b3b3b3;
    font-size: 14px;
    padding: 20px 0;
    text-align: center;
  }

  .on-this-day-content {
    .date-label {
      font-size: 13px;
      color: #b3b3b3;
      margin-bottom: 12px;
    }
  }

  .years-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .year-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    overflow: hidden;
  }

  .year-header {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .year {
    font-size: 15px;
    font-weight: 600;
    color: #1DB954;
  }

  .count {
    margin-left: auto;
    font-size: 12px;
    color: #b3b3b3;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    margin-right: 8px;
  }

  .chevron {
    font-size: 10px;
    color: #b3b3b3;
  }

  .songs-list {
    padding: 0 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .song-item {
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
