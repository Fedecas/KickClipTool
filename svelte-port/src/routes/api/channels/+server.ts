import { json } from '@sveltejs/kit';

const CHANNELS_ENDPOINT = 'https://kick.com/api/search';

export async function GET({ url }): Promise<Response> {
  let result: any = {};

  try {
    const response = await fetch(CHANNELS_ENDPOINT + url.search, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome",
        "Allow-Origin": "*",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json"
      },
      method: 'GET',
      mode: 'cors',
      credentials: 'omit'
    })
    if (!response.ok)
      throw new Error('Network response was not ok (' + response.status + ')')

    result = await response.json()
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return json(result);
}