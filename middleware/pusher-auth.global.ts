import {usePusher} from '@/composables/pusher'
export default defineNuxtRouteMiddleware((to, from) => {
    usePusher()
})