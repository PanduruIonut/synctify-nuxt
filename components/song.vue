<script setup lang="ts">
import { ref, onUpdated } from "vue";
import { Song } from "@/types/song";

const props = defineProps<{ song: Song }>();
const modifiedSong = ref(getModifiedSong(props.song));

onUpdated(() => {
  modifiedSong.value = getModifiedSong(props.song);
});
function getModifiedSong(song: Song) {
  const modified = { ...song };
  modified.images = JSON.parse(modified.images);
  return modified;
}
</script>
<template>
  <div class="song">
    <div class="song__image-wrapper">
      <img class="song__image" :src="modifiedSong.images[2].url" :alt="modifiedSong.title" />
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

  &__image-wrapper {
    width: 45px;
    height: 45px;
    flex-shrink: 0;
  }

  &__image {
    width: 45px;
    height: 45px;
    border-radius: 4px;
    object-fit: cover;
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
    }

    &-artist {
      font-size: 12px;
      color: #b3b3b3;
    }
  }
}
</style>
