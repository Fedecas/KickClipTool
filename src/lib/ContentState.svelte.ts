import type { ChannelRef } from './types';
import { getContext, setContext } from 'svelte';
import type { ChannelState } from './ChannelState.svelte';
import type { ClipState } from './ClipState.svelte';

const CONTENT_KEY = Symbol('content');

export class ContentState {
  channelState: ChannelState | null = null;
  clipState: ClipState | null = null;

  hasResults: boolean = $derived(!!this.channelState?.hasResults || !!this.clipState?.hasResults);
  //endReached = $derived(this.channelSelected &&/*channelRef.nextCursor === ''*/ this.sort === this.lastSort);

  constructor(chs: ChannelState, cls: ClipState) {
    this.channelState = chs;
    this.clipState = cls;
  }

  searchChannels = async (value: string) => {
    //this.lastSort = this.sort;
    //this.sort = 'date';
    await this.channelState?.search(value);
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
