<template>
    <div>
        <p>Loading...</p>
    </div>
</template>

<script setup lang="ts">
import { useUser } from '@/stores/user'

const route = useRoute();
const router = useRouter();


const exchangeAuthorizationCodeForToken = async (code: string) => {
    const store = useUser()
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
        const response = await fetch('http://127.0.0.1:8000/callback', {
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
        router.push('/dashboard')
    } catch (error) {
        console.error(error);
        router.push('/error')
    }
})
</script>