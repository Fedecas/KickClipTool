import { json } from '@sveltejs/kit'

const CHANNELS_ENDPOINT = 'https://kick.com/api/search'

export async function GET({ url }): Promise<Response> {
  let result: any[] = [];

  const requestUrl: string = CHANNELS_ENDPOINT + '?' + url.searchParams;
  console.debug('fetching', requestUrl, '...');
  const response: Response = await fetch(requestUrl, {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
        "Sec-GPC": "1",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Priority": "u=0, i"
    },
    "method": "GET",
    "mode": "cors"
  });
  console.debug('fetch ended:', response.status, response.statusText);
  /*
  console.log('Content-Type:', response.headers.get('Content-Type'));
  console.log('Set-Cookie:', response.headers.get('Set-Cookie'));
  console.debug(await response.text());
  */

  if (response.ok) {
    const content = await response.json();
    result = content?.channels || [];
  }

  return json({'content': result});
}