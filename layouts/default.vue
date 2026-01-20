<template>
  <div class="app-layout">
    <slot />
    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import PlayerBar from '@/components/PlayerBar.vue'
import { useSpotifyPlayer } from '@/composables/useSpotifyPlayer'

const { initPlayer } = useSpotifyPlayer()

onMounted(() => {
  initPlayer()
})
</script>

<style lang="scss">
.app-layout {
  min-height: 100vh;
  padding-bottom: 90px; // Space for player bar
}
</style>
