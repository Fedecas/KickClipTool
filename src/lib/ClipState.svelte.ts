import { getContext, setContext } from 'svelte';
import type { ClipObject, SortType } from './types';

const CLIP_KEY = Symbol('clip');

export class ClipState {
  clips: ClipObject[] = $state([]);
  downloads = $state([]);
  sort: SortType = $state('date');
  hasResults: boolean = $derived(this.clips.length > 0);
  lastSort: SortType = 'date';

  constructor() {}
}

export function getClipState(): ClipState {
  return getContext(CLIP_KEY) as ClipState;
}

export function setClipState(cls: ClipState): ClipState {
  return setContext(CLIP_KEY, cls);
}
