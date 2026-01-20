import { ref } from 'vue'
import { useUser } from '@/stores/user'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: any
  }
}

export interface TrackInfo {
  uri: string
  name: string
  artist: string
  album: string
  albumArt: string
  duration: number
}

const player = ref<any>(null)
const deviceId = ref<string | null>(null)
const isReady = ref(false)
const isPlaying = ref(false)
const currentTrack = ref<TrackInfo | null>(null)
const position = ref(0)
const duration = ref(0)
const volume = ref(50)
const error = ref<string | null>(null)

// Queue management
const queue = ref<string[]>([])
const originalQueue = ref<string[]>([])
const currentIndex = ref(0)
const shuffle = ref(false)

let positionInterval: ReturnType<typeof setInterval> | null = null
let initialized = false

export const useSpotifyPlayer = () => {
  const store = useUser()

  const loadSDK = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.Spotify) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.body.appendChild(script)

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve()
      }
    })
  }

  const startPositionUpdate = () => {
    if (positionInterval) clearInterval(positionInterval)
    positionInterval = setInterval(() => {
      if (isPlaying.value && position.value < duration.value) {
        position.value += 1000
      }
    }, 1000)
  }

  const stopPositionUpdate = () => {
    if (positionInterval) {
      clearInterval(positionInterval)
      positionInterval = null
    }
  }

  const initPlayer = async () => {
    if (initialized) return
    initialized = true

    try {
      await loadSDK()

      const token = store.user.accessToken
      if (!token) {
        error.value = 'No access token available'
        return
      }

      player.value = new window.Spotify.Player({
        name: 'Synctify Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(store.user.accessToken)
        },
        volume: volume.value / 100
      })

      player.value.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify Player ready with Device ID:', device_id)
        deviceId.value = device_id
        isReady.value = true
        error.value = null
      })

      player.value.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline:', device_id)
        isReady.value = false
      })

      player.value.addListener('player_state_changed', (state: any) => {
        if (state) {
          isPlaying.value = !state.paused
          position.value = state.position
          duration.value = state.duration

          if (state.track_window?.current_track) {
            const track = state.track_window.current_track
            currentTrack.value = {
              uri: track.uri,
              name: track.name,
              artist: track.artists.map((a: any) => a.name).join(', '),
              album: track.album.name,
              albumArt: track.album.images[0]?.url || '',
              duration: state.duration
            }

            // Update current index based on playing track
            const idx = queue.value.indexOf(track.uri)
            if (idx !== -1) {
              currentIndex.value = idx
            }
          }

          if (!state.paused) {
            startPositionUpdate()
            error.value = null
          } else {
            stopPositionUpdate()
          }
        }
      })

      player.value.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization error:', message)
        error.value = message
      })

      player.value.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication error:', message)
        if (!isReady.value) {
          error.value = 'Authentication failed. Please re-authorize.'
        }
      })

      player.value.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Account error:', message)
        error.value = 'Spotify Premium required for playback'
      })

      await player.value.connect()
    } catch (e: any) {
      error.value = e.message
      console.error('Failed to initialize Spotify player:', e)
    }
  }

  const MAX_QUEUE_SIZE = 50 // Spotify API limit

  const playTrackFromQueue = async (index: number) => {
    if (!deviceId.value || !store.user.accessToken) {
      error.value = 'Player not ready'
      return
    }

    if (index < 0 || index >= queue.value.length) {
      return
    }

    currentIndex.value = index

    // Get a window of tracks around current index to avoid 413 error
    const start = Math.max(0, index - 25)
    const end = Math.min(queue.value.length, index + 25)
    const windowedQueue = queue.value.slice(start, end)
    const offsetInWindow = index - start

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${store.user.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: windowedQueue,
            offset: { position: offsetInWindow }
          })
        }
      )

      if (!response.ok && response.status !== 204) {
        const text = await response.text()
        if (text) {
          const data = JSON.parse(text)
          throw new Error(data.error?.message || 'Failed to play track')
        }
        throw new Error('Failed to play track')
      }

      error.value = null
      isPlaying.value = true
    } catch (e: any) {
      error.value = e.message
      console.error('Failed to play track:', e)
    }
  }

  const setQueue = (uris: string[]) => {
    queue.value = uris
  }

  const playTrack = async (spotifyUri: string, allUris?: string[]) => {
    if (!deviceId.value || !store.user.accessToken) {
      error.value = 'Player not ready'
      return
    }

    // If a queue is provided, use it
    if (allUris && allUris.length > 0) {
      queue.value = allUris
      const index = allUris.indexOf(spotifyUri)
      currentIndex.value = index >= 0 ? index : 0
      await playTrackFromQueue(currentIndex.value)
      return
    }

    // Single track playback (add to queue of 1)
    queue.value = [spotifyUri]
    currentIndex.value = 0

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${store.user.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: [spotifyUri]
          })
        }
      )

      if (!response.ok && response.status !== 204) {
        const text = await response.text()
        if (text) {
          const data = JSON.parse(text)
          throw new Error(data.error?.message || 'Failed to play track')
        }
        throw new Error('Failed to play track')
      }

      error.value = null
      isPlaying.value = true
    } catch (e: any) {
      error.value = e.message
      console.error('Failed to play track:', e)
    }
  }

  const togglePlay = async () => {
    if (player.value) {
      await player.value.togglePlay()
    }
  }

  const pause = async () => {
    if (player.value) {
      await player.value.pause()
    }
  }

  const resume = async () => {
    if (player.value) {
      await player.value.resume()
    }
  }

  const seek = async (positionMs: number) => {
    if (player.value) {
      await player.value.seek(positionMs)
      position.value = positionMs
    }
  }

  const setVolume = async (volumePercent: number) => {
    if (player.value) {
      volume.value = volumePercent
      await player.value.setVolume(volumePercent / 100)
    }
  }

  const nextTrack = async () => {
    if (queue.value.length > 1 && currentIndex.value < queue.value.length - 1) {
      await playTrackFromQueue(currentIndex.value + 1)
    } else if (player.value) {
      // Fallback to SDK method
      await player.value.nextTrack()
    }
  }

  const previousTrack = async () => {
    if (queue.value.length > 1 && currentIndex.value > 0) {
      await playTrackFromQueue(currentIndex.value - 1)
    } else if (player.value) {
      // Fallback to SDK method
      await player.value.previousTrack()
    }
  }

  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const toggleShuffle = async () => {
    shuffle.value = !shuffle.value

    if (queue.value.length <= 1) return

    const currentUri = currentTrack.value?.uri

    if (shuffle.value) {
      // Save original queue and shuffle
      originalQueue.value = [...queue.value]
      const otherTracks = queue.value.filter(uri => uri !== currentUri)
      const shuffled = shuffleArray(otherTracks)
      // Keep current track at the start, shuffle the rest
      queue.value = currentUri ? [currentUri, ...shuffled] : shuffled
      currentIndex.value = 0
    } else {
      // Restore original queue
      queue.value = [...originalQueue.value]
      if (currentUri) {
        currentIndex.value = queue.value.indexOf(currentUri)
        if (currentIndex.value === -1) currentIndex.value = 0
      }
    }
  }

  const disconnect = () => {
    stopPositionUpdate()
    if (player.value) {
      player.value.disconnect()
    }
  }

  return {
    player,
    deviceId,
    isReady,
    isPlaying,
    currentTrack,
    position,
    duration,
    volume,
    error,
    queue,
    currentIndex,
    shuffle,
    initPlayer,
    playTrack,
    setQueue,
    togglePlay,
    pause,
    resume,
    seek,
    setVolume,
    nextTrack,
    previousTrack,
    toggleShuffle,
    disconnect
  }
}
