
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
  modified.images = JSON.parse(song.images).map((url: string) =>
    url.replace(/^"|"$/g, "")
  );
  return modified;
}
</script>
<template>
  <div class="song">
    <v-img class="song__image" :src="modifiedSong.images[2]" />
    <div class="song__info">
      <v-label class="song__info-title">{{ modifiedSong.title }}</v-label>
      <v-label class="song__info-artist">{{ modifiedSong.artist }}</v-label>
    </div>
  </div>
</template>
<style lang="scss">
.song {
  display: flex;
  &__image {
    max-width: 40px;
    max-height: 40px;
    border-radius:5px;
  }
  &__info {
    display: flex;
    flex-direction: column;
    margin-left: 5px;
    &-title {
      font-size: 15px;
      font-weight: 500;
    }
    &-artist {
      font-size: 13px;
    }
  }
}
</style>