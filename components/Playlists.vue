<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUser } from '@/stores/user'
import handleFetch from '@/services/api'

const store = useUser()
const runtimeConfig = useRuntimeConfig()
const playlists = ref<any[]>([])
const loading = ref(true)
const syncing = ref(false)
const error = ref<string | null>(null)

const emit = defineEmits(['selectPlaylist'])

async function fetchPlaylists() {
  if (!store.user?.id) return
  loading.value = true

  try {
    const response = await handleFetch(
      `${runtimeConfig.public.API_BASE_URL}/api/user/playlists/${store.user.id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    )

    if (!response.ok) throw new Error('Failed to fetch playlists')

    const data = await response.json()
    playlists.value = data.playlists || []
  } catch (e) {
    error.value = 'Could not load playlists'
  } finally {
    loading.value = false
  }
}

async function syncPlaylists() {
  if (!store.user?.id || !store.user?.accessToken) return
  syncing.value = true

  try {
    const response = await handleFetch(
      `${runtimeConfig.public.API_BASE_URL}/api/user/sync_playlists`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: store.user.accessToken,
          spotify_id: store.user.id
        })
      }
    )

    if (!response.ok) throw new Error('Failed to start sync')

    setTimeout(() => {
      fetchPlaylists()
      syncing.value = false
    }, 5000)
  } catch (e) {
    error.value = 'Could not sync playlists'
    syncing.value = false
  }
}

function selectPlaylist(playlist: any) {
  emit('selectPlaylist', playlist)
}

onMounted(() => {
  fetchPlaylists()
})

watch(() => store.user?.id, (newId) => {
  if (newId) fetchPlaylists()
})
</script>

<template>
  <div class="playlists-container">
    <div class="header">
      <h3 class="title">My Playlists</h3>
      <v-btn
        size="small"
        :loading="syncing"
        @click="syncPlaylists"
        class="sync-btn"
      >
        {{ syncing ? 'Syncing...' : 'Sync' }}
      </v-btn>
    </div>

    <div v-if="loading" class="loading">Loading playlists...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="playlists.length === 0" class="empty">
      No playlists synced yet. Click Sync to backup your playlists.
    </div>

    <div v-else class="playlists-grid">
      <div 
        v-for="playlist in playlists" 
        :key="playlist.id" 
        class="playlist-card"
        @click="selectPlaylist(playlist)"
      >
        <img
          v-if="playlist.image_url"
          :src="playlist.image_url"
          :alt="playlist.name"
          class="playlist-image"
        />
        <div v-else class="playlist-image placeholder">
          <span>🎵</span>
        </div>
        <div class="playlist-info">
          <span class="playlist-name" :title="playlist.name">{{ playlist.name }}</span>
          <span class="playlist-tracks">{{ playlist.tracks_count }} songs</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.playlists-container {
  background-color: #1a1a1a;
  border-radius: 10px;
  padding: 20px;
  margin-top: 17px;
  box-shadow: 4px 4px 16px 1px rgba(0, 0, 0, 0.75);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.sync-btn {
  background-color: #1DB954 !important;
  color: black !important;
  font-weight: 600;
}

.loading,
.error,
.empty {
  color: #b3b3b3;
  font-size: 14px;
  padding: 20px 0;
  text-align: center;
}

.error {
  color: #ff6b6b;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.playlist-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.playlist-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;

  &.placeholder {
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
}

.playlist-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.playlist-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-tracks {
  font-size: 12px;
  color: #b3b3b3;
}
</style>
