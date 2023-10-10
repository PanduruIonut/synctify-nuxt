export type UserSettings = {
    redirectUri: string;
    clientId: string;
    clientSecret: string;

}

export type User = {
    settings: UserSettings
    accessToken?: string;
}
