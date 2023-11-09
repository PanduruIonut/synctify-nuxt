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
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: `${config.public.PUSHER_KEY}`,
    wsHost: 'localhost',
    wsPort: 6001,
    cluster: 'eu',
    auth:{
      headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ',
      },
  },
  })
})
