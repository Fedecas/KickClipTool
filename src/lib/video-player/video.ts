import Hls, { Events, ErrorTypes } from 'hls.js';

const MAX_ATTEMPTS_TO_RECOVER_VIDEO = 3;

function mountHLS(ve: HTMLVideoElement, url: string): Hls {
  const hlsConfig = {
    //debug: true,
    videoPreference: { videoCodec: 'avc1.640028' },
    audioPreference: { audioCodec: 'mp4a.40.2' },
  };
  const hls = new Hls(hlsConfig);
  let dummy = document.createElement('video');
  hls.attachMedia(dummy);
  hls.loadSource(url);

  let playOffset = 0;
  let startFailed = false;
  let recoveryAttempts = 0;

  hls.on(Events.BUFFER_CREATED, (e, d) => {
    startFailed = !d.tracks.audio || !d.tracks.video;
  });

  hls.on(Events.MEDIA_ATTACHED, () => {
    if (startFailed) {
      hls?.startLoad(playOffset);
    }
  });

  hls.on(Events.ERROR, (e, d) => {
    playOffset = (d.frag?.playlistOffset || playOffset) + 0.1;
    if (d.fatal) {
      switch (d.type) {
        case ErrorTypes.MEDIA_ERROR:
          console.warn(e, ': Media error');
          if (recoveryAttempts < MAX_ATTEMPTS_TO_RECOVER_VIDEO) {
            recoveryAttempts += 1;
            console.debug('trying to recover (', recoveryAttempts,') ...');
            hls?.recoverMediaError();
          } else {
            console.error('There are no more recovery attempts.');
          }
          break;
        case ErrorTypes.NETWORK_ERROR:
          console.error('Network error. Check CORS or network connectivity.');
          break;
        default:
          hls?.destroy();
          console.error('Fatal error, HLS destroyed.');
          break;
      }
    }
  });

  dummy.addEventListener('canplaythrough', function onDummyPlaying() {
    if (!hls || startFailed) return;
    hls.detachMedia();
    hls.attachMedia(ve);
  });

  return hls;
}

export function loadVideo(ve: HTMLVideoElement, url: string): Hls | null {
  let hls: Hls | null = null;
  const format = url.split('.').at(-1) ?? '';
  if (format === 'm3u8') {
    if (ve.canPlayType('application/vnd.apple.mpegurl')) {
      ve.src = url;
    } else if (Hls.isSupported()) {
      hls = mountHLS(ve, url);
    } else {
      console.error("HLS not supported!");
    }
  } else if (format === 'mp4') {
    if (ve.canPlayType('video/mp4')) {
      ve.src = url;
    } else {
      console.error("MP4 not supported!");
    }
  } else {
    console.error("Unsupported video format!");
  }
  return hls;
}