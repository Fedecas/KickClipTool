import type Hls from 'hls.js';
import type { HlsConfig } from 'hls.js';

const MAX_ATTEMPTS_TO_RECOVER_VIDEO = 3;

async function mountHLS(ve: HTMLVideoElement, url: string): Promise<Hls | null> {
  const { default: Hls, ErrorTypes, Events } = await import('hls.js');
  if (!Hls.isSupported()) return null;

  const hlsConfig: Partial<HlsConfig> = {
    startLevel: 0,
    autoStartLoad: true,
    videoPreference: { videoCodec: 'avc1.640028' },
    audioPreference: { audioCodec: 'mp4a.40.2' },
  };
  const hls: Hls = new Hls(hlsConfig);
  let playOffset: number = 0;
  let recoveryAttempts: number = 0;
  let startFailed: boolean = false;

  hls.attachMedia(ve);
  hls.loadSource(url);

  ve.addEventListener('canplaythrough', () => {
    if (!hls || startFailed) return;
    ve.dispatchEvent(new CustomEvent('ready'));
  });

  hls.on(Events.BUFFER_CREATED, (_, d) => {
    startFailed = !d.tracks.audio || !d.tracks.video;
  });

  hls.on(Events.MEDIA_ATTACHED, () => {
    if (!hls || !startFailed) return;
    hls.startLoad(playOffset);
  });

  hls.on(Events.ERROR, (_, d) => {
    if (!hls || !d.fatal) return;
    playOffset = (d.frag?.playlistOffset || playOffset) + 0.1;
    switch (d.type) {
      case ErrorTypes.MEDIA_ERROR:
        console.warn('Media error');
        if (recoveryAttempts < MAX_ATTEMPTS_TO_RECOVER_VIDEO) {
          recoveryAttempts += 1;
          console.debug('trying to recover... (', recoveryAttempts,')');
          hls.recoverMediaError();
        } else {
          console.error('There are no more recovery attempts.');
        }
        break;
      case ErrorTypes.NETWORK_ERROR:
        console.error('Network error. Check CORS or network connectivity.');
        break;
      default:
        hls.destroy();
        console.error('Fatal error, HLS destroyed.');
        break;
    }
  });

  return hls;
}

export async function loadPlaylist(ve: HTMLVideoElement, url: string): Promise<Hls | null> {
  let hls: Hls | null = null;
  if (ve.canPlayType('application/vnd.apple.mpegurl')) {
    ve.src = url;
  } else {
    hls = await mountHLS(ve, url);
    if (!hls) console.error("HLS not supported!");
  }
  return hls;
}