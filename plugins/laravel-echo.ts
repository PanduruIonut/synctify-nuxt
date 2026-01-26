import Echo from 'laravel-echo'
import { io } from 'socket.io-client'

declare global {
  interface Window {
    io: any;
    Echo: any;
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  window.io = io
  
  window.Echo = new Echo({
    broadcaster: 'socket.io',
    host: 'http://grid.home.ro:6001',
    auth: {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ',
      },
    },
  })
})
