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
                },
                id: '',
                accessToken: '',
                refreshToken: '',
                tokenExpiry: '',
            }
        }
    },

    actions: {
        saveSettings(settings: Partial<UserSettings>) {
            return Object.assign(this.user.settings, settings);
        },
        saveUser(user: Partial<User>) {
            return Object.assign(this.user, user);
        }
    },

    getters: {
        getSettings(): UserSettings {
            return this.user.settings
        },
        getRefreshToken():string | undefined {
            return this.user.refreshToken
        }
    }
})