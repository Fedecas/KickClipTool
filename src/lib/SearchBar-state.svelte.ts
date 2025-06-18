import { getContext, setContext, onDestroy } from 'svelte';
import type { Content } from './Content-state.svelte';

const SEARCHBAR_KEY = Symbol('searchbar');
const DEBOUNCE_MS = 600;

export class SearchBar {
  firstSearch = $state(false);
  searching = $state(false);
  selected = $state(false);
  value = $state('');

  timeoutId: ReturnType<typeof setTimeout> | null;
  contentManager: Content;

  constructor(contentManager: Content) {
    this.contentManager = contentManager;
    this.timeoutId = null;
    onDestroy(() => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
    });
  }

  search = async () => {
    this.selected = false;
    this.searching = true;
    await this.contentManager.searchChannels(this.value);
    this.searching = false;
    if (!this.firstSearch) this.firstSearch = true;
  }

  onInput = () => {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(async () => {
      await this.search();
    }, DEBOUNCE_MS);
  }

  select = (ch: string) => {
    this.value = ch;
    this.selected = true;
  }
}

export function getSearchBarContext(): SearchBar {
  return getContext(SEARCHBAR_KEY) as SearchBar;
}

export function setSearchBarContext(sb: SearchBar): SearchBar {
  return setContext(SEARCHBAR_KEY, sb);
}
