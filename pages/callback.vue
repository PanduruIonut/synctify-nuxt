<template>
    <div>
        <p>Loading...</p>
    </div>
</template>

<script setup lang="ts">
import { useUser } from '@/stores/user'
import handleFetch from '@/services/api';


const route = useRoute();
const router = useRouter();
const store = useUser()
const runtimeConfig = useRuntimeConfig();



const exchangeAuthorizationCodeForToken = async (code: string) => {
    const clientSecret = store.user.settings.clientSecret
    const clientId = store.user.settings.clientId
    const redirectUri = store.user.settings.redirectUri
    const payload = {
        client_secret: clientSecret,
        client_id: clientId,
        redirect_uri: redirectUri,
        code: code
    }
    try {
        const response = await handleFetch(`${runtimeConfig.public.API_BASE_URL}/api/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Token exchange failed');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};
onMounted(async () => {
    const code = route.query.code?.toString();

    if (!code) {
        router.push('/')
        return;
    }

    try {
        const response = await exchangeAuthorizationCodeForToken(code);
        store.user.accessToken = response.access_token;
        store.user.refreshToken = response.refresh_token;
        store.user.tokenExpiry  = response.expires_in
        router.push('/dashboard')
    } catch (error) {
        console.error(error);
        router.push('/')
    }
})
</script>