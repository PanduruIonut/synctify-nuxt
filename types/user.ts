export type UserSettings = {
    redirectUri: string;
    clientId: string;
    clientSecret: string;

}

export type User = {
    settings: UserSettings
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: string,
    id?: string;
    pusherAuthenticated: boolean
    fetchSongsNow: boolean
    lastSync?: string
}
