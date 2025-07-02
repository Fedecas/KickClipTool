import { getContext, setContext } from 'svelte';
import type { ClipObject } from '../types';
import type { ContentState } from '../content/ContentState.svelte';

const VIDEO_KEY = Symbol('video');

export class VideoState {
  channel: string = '';
  ext: string = '';
  id: string = $state('');
  thumbnail: string = '';
  title: string = '';
  url: string = '';

  contentState: ContentState | null = null;

  isDownloading: boolean = $derived(this.contentState?.downloads.includes(this.id) ?? false);

  // @ts-expect-error - Can't download if it's not Tauri app
  canDownload: boolean = !!window.__TAURI_INTERNALS__;

  constructor(cs: ContentState) {
    this.contentState = cs;
  }

  open = (clipData: ClipObject) => {
    if (!this.contentState) return;
    const { channel, id, thumbnail, title, video } = clipData;
    this.channel = channel;
    this.ext = video.split('.').at(-1) ?? '';
    this.id = id;
    this.thumbnail = thumbnail;
    this.title = title;
    this.url = video;
    this.contentState.openVideo();
  }

  download = async () => {
    if (!this.contentState || !this.canDownload) return;
    await this.contentState.downloadVideo(this.id, this.url);
  }

  close = () => {
    if (!this.contentState) return;
    this.contentState.closeVideo();
  }
}

export function getVideoState(): VideoState {
  return getContext(VIDEO_KEY) as VideoState;
}

export function setVideoState(vs: VideoState): VideoState {
  return setContext(VIDEO_KEY, vs);
}
