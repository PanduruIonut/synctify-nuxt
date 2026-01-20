<script setup lang="ts">
import { useSpotifyPlayer } from '@/composables/useSpotifyPlayer'

const {
  isPlaying,
  currentTrack,
  position,
  duration,
  volume,
  error,
  shuffle,
  togglePlay,
  seek,
  setVolume,
  nextTrack,
  previousTrack,
  toggleShuffle
} = useSpotifyPlayer()

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const handleSeek = (event: Event) => {
  const target = event.target as HTMLInputElement
  seek(parseInt(target.value))
}

const handleVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  setVolume(parseInt(target.value))
}

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (position.value / duration.value) * 100
})
</script>

<template>
  <Transition name="slide-up">
    <div v-if="currentTrack" class="player-bar">
      <div class="player-content">
        <!-- Track Info -->
        <div class="track-info">
          <img
            v-if="currentTrack.albumArt"
            :src="currentTrack.albumArt"
            :alt="currentTrack.album"
            class="album-art"
          />
          <div class="track-details">
            <span class="track-name">{{ currentTrack.name }}</span>
            <span class="track-artist">{{ currentTrack.artist }}</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <button class="control-btn" :class="{ active: shuffle }" @click="toggleShuffle" title="Shuffle">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>

          <button class="control-btn" @click="previousTrack" title="Previous">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button class="control-btn play-btn" @click="togglePlay" :title="isPlaying ? 'Pause' : 'Play'">
            <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <button class="control-btn" @click="nextTrack" title="Next">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        <!-- Progress -->
        <div class="progress-section">
          <span class="time">{{ formatTime(position) }}</span>
          <div class="progress-bar-container">
            <input
              type="range"
              class="progress-bar"
              :value="position"
              :max="duration"
              @input="handleSeek"
            />
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="time">{{ formatTime(duration) }}</span>
        </div>

        <!-- Volume -->
        <div class="volume-section">
          <svg class="volume-icon" viewBox="0 0 24 24" fill="currentColor">
            <path v-if="volume > 50" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            <path v-else-if="volume > 0" d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
          <input
            type="range"
            class="volume-slider"
            :value="volume"
            min="0"
            max="100"
            @input="handleVolume"
          />
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #000 0%, #181818 100%);
  border-top: 1px solid #282828;
  padding: 12px 16px;
  z-index: 1000;
}

.player-content {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 100%;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  max-width: 250px;
}

.album-art {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s, transform 0.1s;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    color: white;
    transform: scale(1.1);
  }

  &.active {
    color: #1DB954;
  }

  &.play-btn {
    background: white;
    color: black;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      transform: scale(1.05);
      background: #1DB954;
    }
  }
}

.progress-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 600px;
}

.time {
  font-size: 11px;
  color: #b3b3b3;
  min-width: 40px;
  text-align: center;
}

.progress-bar-container {
  flex: 1;
  position: relative;
  height: 4px;
  background: #4d4d4d;
  border-radius: 2px;
  cursor: pointer;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: white;
  border-radius: 2px;
  pointer-events: none;
  transition: background 0.2s;
}

.progress-bar-container:hover .progress-fill {
  background: #1DB954;
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.volume-icon {
  width: 20px;
  height: 20px;
  color: #b3b3b3;
  flex-shrink: 0;
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #4d4d4d;
  border-radius: 2px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover::-webkit-slider-thumb {
    opacity: 1;
  }
}

.error-message {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4444;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
