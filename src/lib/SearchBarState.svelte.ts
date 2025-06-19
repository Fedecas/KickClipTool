import { getContext, setContext } from 'svelte';
import type { ContentState } from './ContentState.svelte';
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

  searchClips = async (channel: string) => {
    this.value = channel;
    this.selected = true;
    this.searching = true;
    await this.contentStateManager.searchClips(channel);
    this.searching = false;
  }
}

export function getSearchBarState(): SearchBarState {
  return getContext(SEARCHBAR_KEY) as SearchBarState;
}

export function setSearchBarState(sbs: SearchBarState): SearchBarState {
  return setContext(SEARCHBAR_KEY, sbs);
}
