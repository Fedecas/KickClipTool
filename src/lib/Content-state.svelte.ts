import { searchChannels, searchClips } from '$lib/api';
import { getContext, setContext } from 'svelte';
import type { ChannelObject, ClipObject, SortType } from './types';

const CONTENT_KEY = Symbol('content');

export class Content {
  channels: ChannelObject[] = $state([]);
  clips: ClipObject[] = $state([]);
  sort: SortType = $state('date');
  lastSort: SortType = 'date';

  async searchChannels(value: string) {
    this.channels = [];
    this.lastSort = this.sort;
    this.sort = 'date';

    this.channels = await searchChannels(value);
  }
}

export function getContentContext(): Content {
  return getContext(CONTENT_KEY) as Content;
}

export function setContentContext(c: Content): Content {
  return setContext(CONTENT_KEY, c);
}
