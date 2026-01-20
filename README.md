# Synctify Frontend
## Preview
<img width="1429" height="680" alt="image" src="https://github.com/user-attachments/assets/4813b648-a01c-4ed2-8759-a6652b856661" />

A modern Spotify music library manager built with Nuxt 3, Vue 3, Pinia, and TypeScript.

## Features

### Sync & Backup
- **Liked Songs Sync**: Automatically sync and backup your Spotify liked songs
- **Playlist Sync**: Sync all your Spotify playlists with track details
- **Real-Time Updates**: Live sync status notifications via Pusher WebSockets

### Import & Export
- **Import from Playlists**: Import songs from any playlist (e.g., Shazam) to liked songs
- **Export to JSON/CSV**: Download your entire liked songs library

### Smart Features
- **On This Day**: See songs you added on this date in previous years
- **Search & Filter**: Quickly find songs across your library
- **Date Preservation**: Original timestamps maintained from Spotify

### Authentication
- **Spotify OAuth**: Secure authentication with Spotify
- **Auth Status Monitoring**: Warning banner when authorization expires
- **One-Click Re-auth**: Easy re-authorization flow

## Environment Variables

```env
# API Configuration
API_BASE_URL=http://your-backend-url:8001

# Pusher Configuration (for real-time updates)
PUSHER_KEY=your_pusher_key
```

## Tech Stack
- Nuxt 3 / Vue 3
- Pinia + TypeScript
- Vuetify 3 + TailwindCSS
- Pusher (WebSocket real-time updates)

## Related
- [Synctify Backend](https://github.com/PanduruIonut/synctify-laravel)
