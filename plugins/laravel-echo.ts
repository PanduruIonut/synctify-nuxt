import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher:any;
    Echo:any;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  window.Pusher = Pusher
  
  // Use the same host as the current page, or fall back to config
  const wsHost = typeof window !== 'undefined' 
    ? window.location.hostname 
    : 'localhost';
  
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: `${config.public.PUSHER_KEY}`,
    wsHost: wsHost,
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'eu',
    auth:{
      headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ',
      },
  },
  })
})
