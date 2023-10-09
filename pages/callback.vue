<template>
    <div>
        <p>Loading...</p>
    </div>
</template>
  
<script>
export default {
    async created() {
        const code = this.$route.query.code;
        console.log(code, 'code')

        if (!code) {
            this.$router.push('/');
            return;
        }

        try {
            const response = await this.exchangeAuthorizationCodeForToken(code);
            this.$router.push('dashboard')
        } catch (error) {
            console.error(error);
            this.$router.push('/error');
        }
    },
    methods: {
        async exchangeAuthorizationCodeForToken(code) {
            // TODO: get from user settings
            const clientSecret = ''
            const clientId = "";
            const redirectUri = "";
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
        },
    },
};
</script>