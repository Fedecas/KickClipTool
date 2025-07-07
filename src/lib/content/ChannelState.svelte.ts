import { getContext, setContext } from 'svelte';

import { searchChannels } from '$lib/api';
import type { ChannelObject } from '$lib/types';

const CHANNEL_KEY = Symbol('channel');

export class ChannelState {
  channels: ChannelObject[] = $state([]);
  hasResults: boolean = $derived(this.channels.length > 0);

  constructor() {}

  reset = (): void => {
    this.channels = [];
  }

  search = async (value: string): Promise<void> => {
    this.reset();
    this.channels = await searchChannels(value);
  }
}

export function getChannelState(): ChannelState {
  return getContext(CHANNEL_KEY) as ChannelState;
}

export function setChannelState(chs: ChannelState): ChannelState {
  return setContext(CHANNEL_KEY, chs);
}
