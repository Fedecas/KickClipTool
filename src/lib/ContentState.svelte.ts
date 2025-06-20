import { getContext, setContext } from 'svelte';
import type { ChannelState } from './ChannelState.svelte';
import type { ClipState } from './ClipState.svelte';
import type { SortType } from './types';

const CONTENT_KEY = Symbol('content');

export class ContentState {
  firstSearch: boolean = $state(false);
  searching: boolean = $state(false);
  input: string = $state('');

  channelState: ChannelState | null = null;
  clipState: ClipState | null = null;

  hasResults: boolean = $derived(!!this.channelState?.hasResults || !!this.clipState?.hasResults);
  channelSelected: boolean = $derived(this.clipState?.channel !== '');

  constructor(chs: ChannelState, cls: ClipState) {
    this.channelState = chs;
    this.clipState = cls;
  }

  searchChannels = async () => {
    this.searching = true;
    this.clipState?.reset();
    await this.channelState?.search(this.input);
    this.searching = false;
    if (!this.firstSearch) this.firstSearch = true;
  }

  searchClips = async (channel: string) => {
    this.input = channel;
    this.searching = true;
    this.channelState?.reset();
    await this.clipState?.search(channel);
    this.searching = false;
  }

  moreClips = async (): Promise<boolean> => {
    this.searching = true;
    const res = await this.clipState?.more() ?? false;
    this.searching = false;
    return res;
  }

  selectSort = async (type: SortType) => {
    this.searching = true;
    await this.clipState?.selectSort(type);
    this.searching = false;
  }
}

export function getContentState(): ContentState {
  return getContext(CONTENT_KEY) as ContentState;
}

export function setContentState(cs: ContentState): ContentState {
  return setContext(CONTENT_KEY, cs);
}
