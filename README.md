# ![icon](src-tauri/icons/32x32.png) KICK Clip Tool
[![Kick](https://img.shields.io/badge/Kick-53FC19?logo=kick&logoColor=000)](https://kick.com/) [![Tauri](https://img.shields.io/badge/Tauri-24C8D8?logo=tauri&logoColor=fff)](https://v2.tauri.app/) [![SvelteKit](https://img.shields.io/badge/SvelteKit-%23f1413d.svg?logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![GPL License](https://img.shields.io/badge/License-GPL-green.svg)](https://www.gnu.org/licenses/gpl-3.0.txt) [![](https://img.shields.io/github/v/tag/Fedecas/KickClipTool)](#) 

A lightweight desktop application to watch and download streamer clips from the [KICK](https://kick.com) streaming platform, no login required.  

---

## Features
- 🔍 **Search**: Find streamers and explore their clips.
- 🎬 **Watch**: Stream clips directly in the app..
- ⬇️ **Download**: Save clips locally with one click, no login needed.
- ⚡️ **Fast and responsive UI**
- 🖥️ **Lightweight desktop app**
  
  
## Tech Stack  
**Frontend**: [SvelteKit](https://svelte.dev/docs/kit/introduction) for *reactive* UI components.  
**Styling**: [TailwindCSS](https://tailwindcss.com/docs/installation/using-vite) for *utility-first* CSS styling.  
**Build Tool**: [Vite](https://v6.vite.dev/guide) for *fast* development and production builds.  
**Desktop Framework**: [Tauri](https://v2.tauri.app/start) for *lightweight*, cross-platform desktop applications.  
**Video processing**: [FFmpeg](https://ffmpeg.org) minimal build for clip *download*.  
  
## Possible future features  
- Filter clips by date range.  
- Support for [Twitch](https://www.twitch.tv).  
- VOD playback and download utilities.  
- Chat utilities.  
  
---  

## Build
### Prerequisites
- [Node.js](https://nodejs.org/) (v22 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [yarn](https://yarnpkg.com/)
- [Tauri build dependencies](https://v2.tauri.app/es/start/prerequisites)

### Installation
- Clone the repository:
```sh
git clone https://github.com/Fedecas/KickClipTool.git
cd KickClipTool
```
- Install dependencies:
```sh
npm install
# or: pnpm install, yarn install
```
- Run in development mode:
```sh
npx tauri dev
# or: pnpm tauri dev, yarn tauri dev
```
- Build for release:
```sh
npx tauri build
# or: pnpm tauri build, yarn tauri build
```

### Usage
Launch the built executable found in `src-tauri/target/release` (or `/debug` in dev mode).

---

## Custom FFmpeg
This project includes a minimal **FFmpeg** build for clip downloading and processing (see [README](src-tauri/bin/README.md)).

## Fonts
The app uses the **Giphurs** font family by [@Corne2Plum3](https://github.com/Corne2Plum3). Check out [Giphurs](https://github.com/Corne2Plum3/Giphurs) for more info.

## License
This project is licensed under the GPL v3.0 License (see LICENSE).
