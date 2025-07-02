import { getContext, setContext } from 'svelte';

import { downloadClip } from '$lib/video-player/download';
import type { SortType } from '$lib/types';

import type { ChannelState } from './ChannelState.svelte';
import type { ClipState } from './ClipState.svelte';

const CONTENT_KEY = Symbol('content');

export class ContentState {
  downloads: string[] = $state([]);
  firstSearch: boolean = $state(false);
  input: string = $state('');
  playing: boolean = $state(false);
  searching: boolean = $state(false);

  channelState: ChannelState | null = null;
  clipState: ClipState | null = null;

  channelSelected: boolean = $derived(this.clipState?.channel !== '');
  hasResults: boolean = $derived(!!this.channelState?.hasResults || !!this.clipState?.hasResults);

  constructor(chs: ChannelState, cls: ClipState) {
    this.channelState = chs;
    this.clipState = cls;
  }

  searchChannels = async (): Promise<void> => {
    if (!this.channelState || !this.clipState) return;
    this.searching = true;
    this.clipState.reset();
    await this.channelState.search(this.input);
    this.searching = false;
    if (!this.firstSearch) this.firstSearch = true;
  }

  searchClips = async (channel: string): Promise<void> => {
    if (!this.channelState || !this.clipState) return;
    this.input = channel;
    this.searching = true;
    this.channelState.reset();
    await this.clipState.search(channel);
    this.searching = false;
  }

  moreClips = async (): Promise<boolean> => {
    if (!this.clipState) return false;
    this.searching = true;
    const res = await this.clipState.more();
    this.searching = false;
    return res;
  }

  selectSort = async (type: SortType): Promise<void> => {
    if (!this.clipState) return;
    this.searching = true;
    await this.clipState.selectSort(type);
    this.searching = false;
  }

  openVideo = (): void => {
    this.playing = true;
  }

  downloadVideo = async (id: string, url: string): Promise<void> => {
    this.downloads.push(id);
    await downloadClip(url, id);
    this.downloads.splice(this.downloads.indexOf(id), 1);
  }

  closeVideo = (): void => {
    this.playing = false;
  }
}

export function getContentState(): ContentState {
  return getContext(CONTENT_KEY) as ContentState;
}

export function setContentState(cs: ContentState): ContentState {
  return setContext(CONTENT_KEY, cs);
}
