import type { ChannelObject, ChannelRef, ClipObject, SortType } from './types';
import { searchChannels } from '$lib/api';
import { getContext, setContext } from 'svelte';

const CONTENT_KEY = Symbol('content');

export class ContentState {
  downloads = $state([]);
  channels: ChannelObject[] = $state([]);
  clips: ClipObject[] = $state([]);
  sort: SortType = $state('date');
  channelSelected = $state(false);
  clipSelected = $state(false);

  //channel: ChannelRef | null = null;
  lastSort: SortType = 'date';

  hasResults = $derived(this.channels.length > 0 || this.clips.length > 0);
  endReached = $derived(this.channelSelected &&/*channelRef.nextCursor === ''*/ this.sort === this.lastSort);

  constructor() {}

  searchChannels = async (value: string) => {
    this.channels = [];
    this.lastSort = this.sort;
    this.sort = 'date';
    this.channels = await searchChannels(value);
  }

  searchClips = async (ref: ChannelRef) => {
    /*
    if (this.endReached) {
      notif.success('No more clips');
      return;
    }

    if (channelRef !== channel) {
      channelRef = channel;
      results = [];
    } else if (sort != lastSort) {
      channelRef.nextCursor = '';
      results = [];
    }

    const slug = channelRef.slug;
    const cursor = channelRef.nextCursor || '';
    const res = await searchClips(slug, cursor, sort);
    const clips = results as ClipObject[];
    results = [
      ...clips,
      ...res.clips.filter(c1 => !clips.some(c2 => c1.id === c2.id))
    ];
    channelRef.nextCursor = res.nextCursor;
    */
  }
}

export function getContentState(): ContentState {
  return getContext(CONTENT_KEY) as ContentState;
}

export function setContentState(cs: ContentState): ContentState {
  return setContext(CONTENT_KEY, cs);
}
