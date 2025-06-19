import { getContext, setContext } from 'svelte';
import type { ContentState } from './Content-state.svelte';
import type { ChannelRef } from './types';

const SEARCHBAR_KEY = Symbol('searchbar');

export class SearchBarState {
  firstSearch = $state(false);
  searching = $state(false);
  selected = $state(false);
  value = $state('');

  contentStateManager: ContentState;

  constructor(contentStateManager: ContentState) {
    this.contentStateManager = contentStateManager;
  }

  searchChannel = async () => {
    this.selected = false;
    this.searching = true;
    await this.contentStateManager.searchChannels(this.value);
    this.searching = false;
    if (!this.firstSearch) this.firstSearch = true;
  }

  searchClips = async (ref: ChannelRef) => {
    this.value = ref.name;
    this.selected = true;
    this.searching = true;
    await this.contentStateManager.searchClips(ref);
    this.searching = false;
  }
}

export function getSearchBarState(): SearchBarState {
  return getContext(SEARCHBAR_KEY) as SearchBarState;
}

export function setSearchBarState(sbs: SearchBarState): SearchBarState {
  return setContext(SEARCHBAR_KEY, sbs);
}
