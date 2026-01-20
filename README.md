# Synctify Frontend
## Preview
<img width="1429" height="680" alt="image" src="https://github.com/user-attachments/assets/4813b648-a01c-4ed2-8759-a6652b856661" />

A modern Spotify music library manager built with Nuxt 3, Vue 3, Pinia, and TypeScript. Seamlessly sync, browse, and manage your Spotify liked songs and playlists.

## Features

### Core Functionality
- **Liked Songs Sync**: Automatically sync and backup your Spotify liked songs
- **Playlist Management**: Browse and manage your Spotify playlists
- **Search & Filter**: Quickly find songs across your library

### Import & Export
- **Import from Playlists**: Import songs from any playlist (e.g., Shazam tracks) directly to your liked songs with duplicate detection
- **Original Dates Preserved**: Imported songs retain their original added-at timestamps

### Authentication
- **Spotify OAuth**: Secure authentication with Spotify
- **Auth Status Monitoring**: Visual warning banner when Spotify authorization expires
- **One-Click Re-authorization**: Easily re-authorize when needed

## Tech Stack
- Nuxt 3
- Vue 3 (Composition API)
- Pinia (State Management)
- TypeScript
- Vuetify 3

## Related
- [Synctify Backend](https://github.com/PanduruIonut/synctify-laravel) - Laravel API backend
