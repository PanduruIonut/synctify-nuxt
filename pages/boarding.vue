<script setup lang="ts">
import { UserSettings } from '@/types/user'
import { useUser } from '@/stores/user'

const store = useUser()
const userSettings = ref<UserSettings>({
    clientId: store.user.settings.clientId,
    clientSecret: store.user.settings.clientSecret,
    redirectUri: store.user.settings.redirectUri,
})

function saveUserSettings() {
    store.saveSettings(userSettings.value);
}

</script>

<style scoped lang="scss">
.boarding-card {
    text-align: center;

    &__text-fields {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        &-input {
            width: 350px;
        }
    }
}
</style>

<template>
    <v-card class="boarding-card">
        <v-card-title>
            Welcome!
        </v-card-title>
        <v-card-text>
            Before continuing you need to setup your spotify api
        </v-card-text>
        <div class="boarding-card__text-fields">
            <v-text-field class="boarding-card__text-fields-input" label="client id"
                v-model="userSettings.clientId"></v-text-field>
            <v-text-field class="boarding-card__text-fields-input" label="client secret"
                v-model="userSettings.clientSecret"></v-text-field>
            <v-text-field class="boarding-card__text-fields-input" label="redirect uri"
                v-model="userSettings.redirectUri"></v-text-field>
        </div>
        <v-btn @click="saveUserSettings()">Save</v-btn>
</v-card></template>