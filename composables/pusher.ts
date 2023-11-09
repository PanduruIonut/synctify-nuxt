import Pusher from 'pusher-js'
import { useUser } from '@/stores/user'
import { toast } from "vue3-toastify";
export const usePusher = () => {
    const runtimeConfig = useRuntimeConfig();
    const store = useUser()


    if (process.client) {
        if (process.client) {
            Pusher.logToConsole = true;

            var pusher = new Pusher(runtimeConfig.public.PUSHER_KEY, {
                cluster: 'eu',
                channelAuthorization: { endpoint: `${runtimeConfig.public.API_BASE_URL}/api/broadcasting/auth?token=${store.user.accessToken}` }
            });

            const channel = pusher.subscribe('private-user-' + store.user.id);

            channel.bind('pusher:subscription_succeeded', () => {
                store.user.pusherAuthenticated = true;
            })

            pusher.connection.bind('pusher:connection_established', () => {
                store.user.pusherAuthenticated = true;
                console.log('Pusher connection established');
            });

            pusher.bind('pusher:connection_error', (err) => {
                console.error('Connection error:', err);
                store.user.pusherAuthenticated = false;
            });


            pusher.connection.bind('failed', () => {
                console.error('Pusher connection failed');
                store.user.pusherAuthenticated = false;
            });

            pusher.connection.bind('disconnected', () => {
                console.warn('Pusher connection disconnected');
                store.user.pusherAuthenticated = false;
            });

            channel.bind('SyncLikedSongsCompleted', (data) => {
                console.log(data);
                if (data.status_code && data.status && data.status_code === 200) {
                    toast.success(data.status, {
                        position: toast.POSITION.TOP_CENTER,
                    });

                    store.user.fetchSongsNow = true;

                } else {
                    toast.error(data.status.status, {
                        position: toast.POSITION.TOP_CENTER,
                    });
                }
            });
        }
    }
}