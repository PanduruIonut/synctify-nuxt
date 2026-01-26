<script setup lang="ts">
import { ref, onUpdated, computed } from "vue";
import { Song } from "@/types/song";
import { useSpotifyPlayer } from '@/composables/useSpotifyPlayer'

const props = defineProps<{ song: Song; noClick?: boolean }>();
const modifiedSong = ref(getModifiedSong(props.song));
const { playTrack, currentTrack, isPlaying } = useSpotifyPlayer()

onUpdated(() => {
  modifiedSong.value = getModifiedSong(props.song);
});

function getModifiedSong(song: Song) {
  const modified = { ...song };
  if (typeof modified.images === 'string') {
    try {
      modified.images = JSON.parse(modified.images);
    } catch {
      modified.images = [];
    }
  }
  return modified;
}

function getImageUrl() {
  const images = modifiedSong.value.images;
  if (Array.isArray(images) && images.length > 0) {
    return images[2]?.url || images[1]?.url || images[0]?.url || '';
  }
  return '';
}

function handlePlay() {
  if (props.noClick) return;
  const uri = props.song.spotify_uri || `spotify:track:${props.song.id}`;
  playTrack(uri);
}

const isCurrentlyPlaying = computed(() => {
  if (!currentTrack.value) return false;
  const uri = props.song.spotify_uri || `spotify:track:${props.song.id}`;
  return currentTrack.value.uri === uri && isPlaying.value;
});
</script>

<template>
  <div class="song" :class="{ 'song--playing': isCurrentlyPlaying }" @click="handlePlay">
    <div class="song__image-wrapper">
      <img v-if="getImageUrl()" class="song__image" :src="getImageUrl()" :alt="modifiedSong.title" />
      <div v-else class="song__image song__image--placeholder">🎵</div>
      <div class="song__play-overlay">
        <svg v-if="isCurrentlyPlaying" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>
    <div class="song__info">
      <span class="song__info-title" :title="modifiedSong.title">{{ modifiedSong.title }}</span>
      <span class="song__info-artist" :title="modifiedSong.artist">{{ modifiedSong.artist }}</span>
    </div>
  </div>
</template>

<style lang="scss">
.song {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);

    .song__play-overlay {
      opacity: 1;
    }

    .song__image {
      filter: brightness(0.5);
    }
  }

  &--playing {
    background: rgba(29, 185, 84, 0.15);

    .song__info-title {
      color: #1DB954;
    }
  }

  &__image-wrapper {
    width: 45px;
    height: 45px;
    flex-shrink: 0;
    position: relative;
  }

  &__play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;

    svg {
      width: 20px;
      height: 20px;
      color: white;
    }
  }

  &__image {
    width: 45px;
    height: 45px;
    border-radius: 4px;
    object-fit: cover;
    transition: filter 0.2s;

    &--placeholder {
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
    min-width: 0;
    flex: 1;

    &-title,
    &-artist {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-title {
      font-size: 14px;
      font-weight: 500;
      color: white;
      transition: color 0.2s;
    }

    &-artist {
      font-size: 12px;
      color: #b3b3b3;
    }
  }
}
</style>
