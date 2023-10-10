<script setup lang="ts">
import { useUser } from '@/stores/user'

const store = useUser()
const router = useRouter()
const settings = !Object.values(store.user.settings).some(value => !value);
if(settings){
    store.user.accessToken ? router.push('/dashboard') : router.push('/')
}

const authorizeSpotify = async () => {
    const clientId = store.user.settings.clientId;
    const redirectUri = store.user.settings.redirectUri

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=user-library-read playlist-modify-public playlist-modify-private`;

    window.location.href = authUrl;
};
</script>

<template>
    <div>
        <v-btn @click="authorizeSpotify">Authorize with Spotify</v-btn>
    </div>
</template>