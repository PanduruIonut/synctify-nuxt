<template>
  <div>
    <v-skeleton-loader class="mx-auto border" height="120" type="avatar, heading"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border" type="text"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border album-cover" height="80" type="avatar, text"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border album-cover" height="80" type="avatar, text"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border album-cover" height="80" type="avatar, text"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border album-cover" height="80" type="avatar, text"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border album-cover" height="80" type="avatar, text"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border" type="text"></v-skeleton-loader>
    <v-skeleton-loader class="mx-auto border" height="60" type="table-row"></v-skeleton-loader>
  </div>
</template>
<style>
.album-cover .v-skeleton-loader__avatar {
    border-radius: 0px !important;
  }
</style>