import { getContext, setContext } from 'svelte';
import type { ClipObject, SortType } from './types';
import { searchClips } from './api';

const CLIP_KEY = Symbol('clip');

export class ClipState {
  clips: ClipObject[] = $state([]);
  downloads = $state([]);
  sort: SortType = $state('date');
  channel: string = $state('');
  cursor: string = $state('');
  lastSort: SortType = 'date';

  hasResults = $derived(this.clips.length > 0);
  endReached = $derived(this.channel != '' && this.cursor === '' && this.sort === this.lastSort);

  constructor() {}

  search = async (channel: string) => {
    if (this.channel !== channel) {
      this.channel = channel;
      this.cursor = '';
      this.clips = [];
      this.sort = this.lastSort = 'date';
    } else if (this.sort != this.lastSort) {
      this.lastSort = this.sort;
      this.cursor = '';
      this.clips = [];
    }

    const res = await searchClips(this.channel, this.cursor, this.sort);
    console.log(res);
    this.clips = [
      ...this.clips,
      ...res.clips.filter(c1 => !this.clips.some(c2 => c1.id === c2.id))
    ];
    this.cursor = res.nextCursor;
  }

  more = async () => {
    await this.search(this.channel);
  }

  selectSort = async (type: SortType) => {
    this.sort = type;
    if (this.sort !== this.lastSort) {
      await this.search(this.channel);
    }
  }
}

export function getClipState(): ClipState {
  return getContext(CLIP_KEY) as ClipState;
}

export function setClipState(cls: ClipState): ClipState {
  return setContext(CLIP_KEY, cls);
}
