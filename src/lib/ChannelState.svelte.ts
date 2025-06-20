import { getContext, setContext } from 'svelte';
import type { ChannelObject } from './types';
import { searchChannels } from './api';

const CHANNEL_KEY = Symbol('channel');

export class ChannelState {
  channels: ChannelObject[] = $state([]);
  hasResults: boolean = $derived(this.channels.length > 0);

  constructor() {}

  reset = () => {
    this.channels = [];
  }

  search = async (value: string) => {
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
