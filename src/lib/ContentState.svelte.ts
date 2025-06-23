import { getContext, setContext } from 'svelte';
import type { ChannelState } from './ChannelState.svelte';
import type { ClipState } from './ClipState.svelte';
import type { ClipObject, SortType } from './types';
import { downloadClip } from './video-player/download';

const CONTENT_KEY = Symbol('content');

export class ContentState {
  firstSearch: boolean = $state(false);
  searching: boolean = $state(false);
  input: string = $state('');
  downloads: string[] = $state([]);
  video: ClipObject | null = $state(null);

  // @ts-expect-error - Can't download if it's not Tauri app
  canDownload: boolean = !!window.__TAURI_INTERNALS__;

  channelState: ChannelState | null = null;
  clipState: ClipState | null = null;

  hasResults: boolean = $derived(!!this.channelState?.hasResults || !!this.clipState?.hasResults);
  channelSelected: boolean = $derived(this.clipState?.channel !== '');

  constructor(chs: ChannelState, cls: ClipState) {
    this.channelState = chs;
    this.clipState = cls;
    this.downloads = [];
  }

  searchChannels = async () => {
    if (!this.channelState || !this.clipState) return;
    this.searching = true;
    this.clipState.reset();
    await this.channelState.search(this.input);
    this.searching = false;
    if (!this.firstSearch) this.firstSearch = true;
  }

  searchClips = async (channel: string) => {
    if (!this.channelState || !this.clipState) return;
    this.input = channel;
    this.searching = true;
    this.channelState.reset();
    await this.clipState.search(channel);
    this.searching = false;
  }

  moreClips = async (): Promise<boolean> => {
    let res = false;
    if (this.clipState) {
      this.searching = true;
      res = await this.clipState.more();
      this.searching = false;
    }
    return res;
  }

  selectSort = async (type: SortType) => {
    if (!this.clipState) return;
    this.searching = true;
    await this.clipState.selectSort(type);
    this.searching = false;
  }

  playVideo = (clipData: ClipObject) => {
    this.video = clipData;
  }

  downloadVideo = async () => {
    if (!this.video || !this.canDownload) return;
    const { id, video } = this.video;
    this.downloads.push(id);
    await downloadClip(video, id);
    this.downloads.splice(this.downloads.indexOf(id), 1);
  }

  closeVideo = () => {
    this.video = null;
  }
}

export function getContentState(): ContentState {
  return getContext(CONTENT_KEY) as ContentState;
}

export function setContentState(cs: ContentState): ContentState {
  return setContext(CONTENT_KEY, cs);
}
