<script setup lang="ts">
import { useUser } from '@/stores/user'
import { useRouter } from 'vue-router'

const store = useUser()
const router = useRouter()

const settings = !Object.values(store.user.settings).some(value => !value);

if (process.client) {
    if (settings) {
        store.user.accessToken ? router.push('/dashboard') : router.push('/authorize')
    } else {
        router.push('/boarding')
    }
}
</script>
<template></template>
