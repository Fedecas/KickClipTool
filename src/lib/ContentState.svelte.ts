import { getContext, setContext } from 'svelte';
import type { ChannelState } from './ChannelState.svelte';
import type { ClipState } from './ClipState.svelte';

const CONTENT_KEY = Symbol('content');

export class ContentState {
  channelState: ChannelState | null = null;
  clipState: ClipState | null = null;

  hasResults: boolean = $derived(!!this.channelState?.hasResults || !!this.clipState?.hasResults);

  constructor(chs: ChannelState, cls: ClipState) {
    this.channelState = chs;
    this.clipState = cls;
  }

  // APP -> SB -> CH -> CL (-> VP)
  searchChannels = async (value: string) => {
    await this.channelState?.search(value);
  }

  searchClips = async (channel: string) => {
    await this.clipState?.search(channel);
  }
}

export function getContentState(): ContentState {
  return getContext(CONTENT_KEY) as ContentState;
}

export function setContentState(cs: ContentState): ContentState {
  return setContext(CONTENT_KEY, cs);
}
