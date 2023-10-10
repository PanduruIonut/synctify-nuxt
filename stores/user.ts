import { defineStore } from 'pinia'
import { User, UserSettings } from '@/types/user'

export const useUser = defineStore('storeId', {
    persist: true,
    state: (): { user: User } => {
        return {
            user: {
                settings: {
                    clientId: '',
                    clientSecret: '',
                    redirectUri: ''
                }
            }
        }
    },

    actions: {
        saveSettings(settings: Partial<UserSettings>) {
            return Object.assign(this.user.settings, settings);
        }
    },

    getters: {
        getSettings(): UserSettings {
            return this.user.settings
        }
    }
})