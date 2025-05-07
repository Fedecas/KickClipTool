const CHANNELS_ENDPOINT = 'https://kick.com/api/search'
const CLIPS_ENDPOINT = 'https://kick.com/api/v2/channels'

export async function searchChannels(query: string): Promise<any[]> {
  let result: any[] = [];
  let response: Response = {} as Response;
  if (query.length >= 3) {
    const params = new URLSearchParams({'searched_word': query});
    const requestUrl: string = `${CHANNELS_ENDPOINT}?${params}`;

    console.debug('fetching', requestUrl, '...');
    try {
      response = await fetch(requestUrl);
      console.debug(`fetch ended (${response.status}, ${response.statusText})`);

      if (response.ok) {
        const res = await response.json();
        result = res?.channels || [];
      } else {
        console.error(`Network response was not ok (${response.status})`);
      }
    } catch (error) {
      console.error(`Error fetching channels: ${error}`);
    }
  }

  return result;
}

export async function searchClips(query: string, cursor: string): Promise<any> {
  let result: any = {};
  let response: Response = {} as Response;
  if (query.length >= 3) {
    let requestUrl: string = `${CLIPS_ENDPOINT}/${query}/clips`;

    if (cursor) {
      const params = new URLSearchParams({'cursor': cursor});
      requestUrl += `?${params}`;
    }

    console.debug('fetching', requestUrl, '...');
    try {
      response = await fetch(requestUrl);
      console.debug(`fetch ended (${response.status}, ${response.statusText})`);
  
      if (response.ok) {
        result = await response.json();
      } else {
        console.error(`Network response was not ok (${response.status})`);
      }
    } catch (error) {
      console.error(`Error fetching clips: ${error}`);
    }
  }

  return result;
}