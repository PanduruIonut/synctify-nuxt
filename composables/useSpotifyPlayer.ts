import { ref, onMounted, onUnmounted } from 'vue'
import { useUser } from '@/stores/user'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: any
  }
}

export const useSpotifyPlayer = () => {
  const store = useUser()
  const player = ref<any>(null)
  const deviceId = ref<string | null>(null)
  const isReady = ref(false)
  const isPlaying = ref(false)
  const currentTrack = ref<string | null>(null)
  const error = ref<string | null>(null)

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

  const initPlayer = async () => {
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
        volume: 0.5
      })

      player.value.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify Player ready with Device ID:', device_id)
        deviceId.value = device_id
        isReady.value = true
        error.value = null // Clear any previous errors when ready
      })

      player.value.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline:', device_id)
        isReady.value = false
      })

      player.value.addListener('player_state_changed', (state: any) => {
        if (state) {
          isPlaying.value = !state.paused
          if (state.track_window?.current_track) {
            currentTrack.value = state.track_window.current_track.uri
          }
          // Clear error on successful state change
          if (error.value && !state.paused) {
            error.value = null
          }
        }
      })

      player.value.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Initialization error:', message)
        error.value = message
      })

      player.value.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Authentication error:', message)
        // Only set error if player isn't already ready
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

  const playTrack = async (spotifyUri: string) => {
    if (!deviceId.value || !store.user.accessToken) {
      error.value = 'Player not ready'
      return
    }

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
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to play track')
      }

      error.value = null // Clear error on successful play
      currentTrack.value = spotifyUri
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

  const disconnect = () => {
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
    error,
    initPlayer,
    playTrack,
    togglePlay,
    pause,
    disconnect
  }
}
