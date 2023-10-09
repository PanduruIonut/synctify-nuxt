<template>
    <div>
        <v-btn @click="authorizeSpotify">Authorize with Spotify</v-btn>
    </div>
</template>

<script>
export default {
    methods: {
        async authorizeSpotify() {
            // TODO: get from user settings
            const clientId = "";
            const redirectUri = "http://localhost:3000/callback";

            const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
                redirectUri
            )}&scope=user-library-read playlist-modify-public playlist-modify-private`;

            window.location.href = authUrl;
        },
    },
};
</script>