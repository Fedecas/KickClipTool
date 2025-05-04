const CHANNELS_ENDPOINT = 'https://kick.com/api/search'
const CLIPS_ENDPOINT = 'https://kick.com/api/v2/channels'

export async function searchChannels(query: string): Promise<any[]> {
  let result: any[] = [];
  if (query) {
    const params = new URLSearchParams({'searched_word': query});
    const requestUrl: string = `${CHANNELS_ENDPOINT}?${params}`;

    console.debug('fetching', requestUrl, '...');
    // ver timeout
    const response: Response = await fetch(requestUrl);
    console.debug('fetch ended:', response.status, response.statusText);

    if (response.ok) {
      const res = await response.json();
      result = res?.channels || [];
    } else {
      console.error(`Network response was not ok (${response.status})`);
    }
  }

  return result;
}

export async function searchClips(query: string): Promise<any> {
  let result: any[] = [];
  if (query) {
    const requestUrl: string = `${CLIPS_ENDPOINT}/${query}/clips`;

    console.debug('fetching', requestUrl, '...');
    // ver timeout
    const response = await fetch(requestUrl);
    console.debug('fetch ended:', response.status, response.statusText);

    if (response.ok) {
      result = await response.json();
    } else {
      console.error(`Network response was not ok (${response.status})`);
    }
  }

  return result;
}