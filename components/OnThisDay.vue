<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '@/stores/user'
import Song from '@/components/song.vue'
import handleFetch from '@/services/api'

const store = useUser()
const runtimeConfig = useRuntimeConfig()
const loading = ref(true)
const data = ref<any>(null)
const error = ref<string | null>(null)
const expanded = ref<Record<string, boolean>>({})

async function fetchOnThisDay() {
  if (!store.user?.id) return

  try {
    const response = await handleFetch(
      `${runtimeConfig.public.API_BASE_URL}/api/user/on_this_day/${store.user.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch')
    }

    data.value = await response.json()

    // Expand first year by default
    if (data.value.songs_by_year) {
      const years = Object.keys(data.value.songs_by_year)
      if (years.length > 0) {
        expanded.value[years[0]] = true
      }
    }
  } catch (e) {
    error.value = 'Could not load memories'
  } finally {
    loading.value = false
  }
}

function toggleYear(year: string) {
  expanded.value[year] = !expanded.value[year]
}

function formatSong(song: any) {
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

onMounted(() => {
  fetchOnThisDay()
})

watch(() => store.user?.id, (newId) => {
  if (newId) fetchOnThisDay()
})
</script>

<template>
  <div class="on-this-day">
    <div class="header">
      <span class="icon">📅</span>
      <div class="title-section">
        <h3 class="title">On This Day</h3>
        <span v-if="data" class="date">{{ data.date }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading memories...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="data && data.total_count === 0" class="empty">
      No songs saved on this day in previous years
    </div>

    <div v-else-if="data" class="years-container">
      <div v-for="(songs, year) in data.songs_by_year" :key="year" class="year-section">
        <div class="year-header" @click="toggleYear(String(year))">
          <span class="year">{{ year }}</span>
          <span class="count">{{ songs.length }} song{{ songs.length > 1 ? 's' : '' }}</span>
          <span class="chevron">{{ expanded[String(year)] ? '▼' : '▶' }}</span>
        </div>
        <div v-if="expanded[String(year)]" class="songs-list">
          <div v-for="song in songs" :key="song.id" class="song-item">
            <Song :song="formatSong(song)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.on-this-day {
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 20px;
  margin-top: 17px;
  box-shadow: 4px 4px 16px 1px rgba(0, 0, 0, 0.75);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 12px;
}

.icon {
  font-size: 28px;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.date {
  font-size: 13px;
  color: #b3b3b3;
}

.loading,
.error,
.empty {
  color: #b3b3b3;
  font-size: 14px;
  padding: 10px 0;
}

.error {
  color: #ff6b6b;
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
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.year {
  font-size: 16px;
  font-weight: 600;
  color: #1DB954;
}

.count {
  margin-left: auto;
  font-size: 13px;
  color: #b3b3b3;
  margin-right: 10px;
}

.chevron {
  font-size: 12px;
  color: #b3b3b3;
}

.songs-list {
  padding: 0 15px 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  padding: 6px 0;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
