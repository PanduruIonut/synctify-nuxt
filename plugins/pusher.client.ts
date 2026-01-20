import Pusher from 'pusher-js'
import { useUser } from '@/stores/user'
import { toast } from "vue3-toastify";
import formatDateTime from '@/utils/datetime'

let pusherInitialized = false;

export default defineNuxtPlugin((nuxtApp) => {
    if (pusherInitialized) return;
    
    const initPusher = () => {
        const store = useUser();
        const runtimeConfig = useRuntimeConfig();
        
        if (!store.user?.id || !store.user?.accessToken) {
            return;
        }
        
        if (pusherInitialized) return;
        pusherInitialized = true;
        
        Pusher.logToConsole = true;
        
        const pusher = new Pusher(runtimeConfig.public.PUSHER_KEY, {
            cluster: 'eu',
            channelAuthorization: { 
                endpoint: `${runtimeConfig.public.API_BASE_URL}/api/broadcasting/auth`,
                transport: 'ajax',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        });

        const channel = pusher.subscribe('private-user-' + store.user.id);

        channel.bind('pusher:subscription_succeeded', () => {
            store.user.pusherAuthenticated = true;
            console.log('Pusher channel subscribed successfully');
        });

        channel.bind('pusher:subscription_error', (error: any) => {
            console.error('Subscription error:', error);
            store.user.pusherAuthenticated = false;
        });

        channel.bind('SyncLikedSongsCompleted', (data: any) => {
            console.log('Sync completed:', data);
            if (data.status_code && data.status && data.status_code === 200) {
                toast.success(data.status, {
                    position: toast.POSITION.TOP_CENTER,
                });
                
                store.user.lastSync = formatDateTime(data.current_time);
                store.user.fetchSongsNow = true;
            } else {
                toast.error(data.status?.status || 'Sync failed', {
                    position: toast.POSITION.TOP_CENTER,
                });
            }
        });
    };
    
    // Watch for user login
    nuxtApp.hook('app:mounted', () => {
        setTimeout(initPusher, 1000);
    });
});
