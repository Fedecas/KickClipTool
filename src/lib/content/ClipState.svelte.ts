import type { ClipObject, SortType } from '$lib/types';
import { getContext, setContext } from 'svelte';
import { searchClips, searchInBatches } from '$lib/api';

const CLIP_KEY = Symbol('clip');

export class ClipState {
  clips: ClipObject[] = $state([]);
  sort: SortType = $state('date');
  channel: string = $state('');
  cursor: string = $state('');
  hasResults: boolean = $derived(this.clips.length > 0);
  endReached: boolean = $derived(this.channel != '' && this.cursor === '');
  startDate: Date | undefined = $state(undefined);
  endDate: Date | undefined = $state(undefined);
  fetchingInBatches: boolean = $state(false);

  constructor() {}

  reset = (): void => {
    this.channel = '';
    this.clips = [];
    this.cursor = '';
    this.sort = 'date';
    this.fetchingInBatches = false;
  };

  search = async (channel: string): Promise<void> => {
    if (this.channel !== channel) {
      this.reset();
      this.channel = channel;
      this.startDate = undefined;
      this.endDate = undefined;
    }

    if (this.startDate && this.endDate) {
      this.fetchingInBatches = true;

      if (this.cursor === '') {
        this.clips = [];
      }

      let pendingClips: ClipObject[] = [];
      let lastUpdate = Date.now();
      const UPDATE_INTERVAL = 100;

      const finalCursor = await searchInBatches(this.channel, this.cursor, this.sort, this.startDate, this.endDate, (newClips) => {
        pendingClips = [
          ...pendingClips,
          ...newClips.filter((c1) => !this.clips.some((c2) => c1.id === c2.id) && !pendingClips.some((c2) => c1.id === c2.id)),
        ];

        const now = Date.now();
        if (now - lastUpdate >= UPDATE_INTERVAL) {
          this.clips = [...this.clips, ...pendingClips];
          pendingClips = [];
          lastUpdate = now;
        }
      });

      if (pendingClips.length > 0) {
        this.clips = [...this.clips, ...pendingClips];
      }

      this.cursor = finalCursor;
      this.fetchingInBatches = false;
    } else {
      const res = await searchClips(this.channel, this.cursor, this.sort, this.startDate, this.endDate);
      this.clips = [...this.clips, ...res.clips.filter((c1) => !this.clips.some((c2) => c1.id === c2.id))];
      this.cursor = res.nextCursor;
    }
  };

  more = async (): Promise<boolean> => {
    let res = false;
    if (!this.endReached && !this.fetchingInBatches) {
      await this.search(this.channel);
      res = true;
    }
    return res;
  };

  selectSort = async (type: SortType): Promise<void> => {
    if (type !== this.sort) {
      const channel = this.channel;
      this.reset();
      this.sort = type;
      this.channel = channel;
      await this.search(this.channel);
    }
  };
}

export function getClipState(): ClipState {
  return getContext(CLIP_KEY) as ClipState;
}

export function setClipState(cls: ClipState): ClipState {
  return setContext(CLIP_KEY, cls);
}
