<template>
    <div class="container-fullwidth">
        <div class="content">
            <img class="container__img"
                src="https://play-lh.googleusercontent.com/eN0IexSzxpUDMfFtm-OyM-nNs44Y74Q3k51bxAMhTvrTnuA4OGnTi_fodN4cl-XxDQc"
                alt="Spotify" width="100" height="100" />
            <p class="container__button">
                <v-btn @click="authorizeSpotify">Authorize</v-btn>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUser } from '@/stores/user'
const store = useUser()
const authorizeSpotify = async () => {
    const clientId = store.user.settings.clientId;
    const redirectUri = store.user.settings.redirectUri

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=user-library-read playlist-modify-public playlist-modify-private user-top-read`;

    window.location.href = authUrl;
};
</script>
<style scoped>
.container-fullwidth {
    width: 100%;
    height: 100vh;
    background-color: #191414;
    display: flex;
    justify-content: center;
    align-items: center;
}

.content {
    text-align: center;
    text-align: -webkit-center;
}

.container-fullwidth__img {
    border-radius: 73%;
}

.container-fullwidth__button {
    margin-top: 24px;
}

button {
    margin-top: 20px;
    color: #191414;
    border-radius: 20px;
    border: 1px solid #191414;
    background-color: #FFFFFF;
    font-size: 12px;
    font-weight: bold;
    padding: 12px 45px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: transform 80ms ease-in;
}
</style>
