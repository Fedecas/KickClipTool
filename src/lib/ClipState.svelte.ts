import { getContext, setContext } from 'svelte';
import type { ClipObject, SortType } from './types';
import { searchClips } from './api';

const CLIP_KEY = Symbol('clip');

export class ClipState {
  clips: ClipObject[] = $state([]);
  downloads: string[] = $state([]);
  sort: SortType = $state('date');
  channel: string = $state('');
  cursor: string = $state('');

  hasResults: boolean = $derived(this.clips.length > 0);
  endReached: boolean = $derived(this.channel != '' && this.cursor === '');

  constructor() {}

  reset = () => {
    this.channel = '';
    this.clips = [];
    this.cursor = '';
    this.sort = 'date';
  }

  search = async (channel: string) => {
    if (this.channel !== channel) {
      this.reset();
      this.channel = channel;
    }

    const res = await searchClips(this.channel, this.cursor, this.sort);
    this.clips = [
      ...this.clips,
      ...res.clips.filter(c1 => !this.clips.some(c2 => c1.id === c2.id))
    ];
    this.cursor = res.nextCursor;
  }

  more = async (): Promise<boolean> => {
    let res = false;
    if (!this.endReached) {
      await this.search(this.channel);
      res = true;
    }
    return res;
  }

  selectSort = async (type: SortType) => {
    if (type !== this.sort) {
      const channel = this.channel;
      this.reset();
      this.sort = type;
      this.channel = channel;
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
