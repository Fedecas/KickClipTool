from asyncio import create_task, sleep
from asyncio.exceptions import CancelledError

from curl_cffi import AsyncSession
from curl_cffi.requests.exceptions import Timeout, DNSError

from models import Channel, Clip
from log import log


SEARCH_ENDPOINT = 'https://kick.com/api/search'
CLIPS_ENDPOINT = 'https://kick.com/api/v2/channels'
DEBOUNCE_TIME = 0.5


class Api:
    def __init__(self):
        self.session = AsyncSession()
        self.running_query = None
        self.last_channel = ''
        self.next_cursor = ''

    async def _clean_current_task(self):
        current = self.running_query
        if current and not current.done():
            current.cancel()
            try:
                await current
            except CancelledError:
                log.debug('cancelling %s...', current.get_name())

    async def _debounced_search(self, url, headers=None, params=None):
        await sleep(DEBOUNCE_TIME)
        result = await self.session.get(url, headers=headers, params=params, impersonate='chrome')
        return result

    async def _get_content(self, url, headers=None, params=None):
        await self._clean_current_task()
        content, msg = {}, ''
        self.running_query = create_task(self._debounced_search(url, headers=headers, params=params))
        response = None
        try:
            response = await self.running_query
            log.debug('successfully request for %s', (url, headers, params))
        except CancelledError:
            log.warning('request %s was cancelled', (url, headers, params))
            raise
        except Timeout:
            log.warning('timeout for %s', (url, headers, params))
            raise
        except DNSError:
            log.warning('Could not resolve host for %s', (url, headers, params))
            raise
        except Exception as exc:
            log.error('unhandled exception "%s" in request %s', str(exc), (url, headers, params))
            raise
        finally:
            self.running_query = None

        if response.status_code in range(200, 300):
            content = response.json()
        else:
            log.error('Response code %d: %s', response.status_code, str(response.content)[:100])
            msg = str(response.status_code)

        return content, msg

    async def get_channels(self, word):
        url = SEARCH_ENDPOINT
        params = {'searched_word': word}
        results, msg = await self._get_content(url, params=params)
        channels = []
        if not msg:
            channels = [Channel.from_dict(c) for c in results.get('channels', [])]
        return channels, msg

    async def get_clips(self, channel):
        do_request = True
        clips, msg = [], ''
        url = f'{CLIPS_ENDPOINT}/{channel}/clips'
        params = {'sort': 'date', 'range': 'all'}
        if channel == self.last_channel:
            if self.next_cursor:
                params.update({'cursor': self.next_cursor})
            else:
                do_request = False
                msg = 'end of chain'
                log.debug('there is no more clips for "%s"', channel)
        else:
            self.last_channel = channel

        if do_request:
            results, msg = await self._get_content(url, params=params)
            if not msg:
                clips = [Clip.from_dict(c) for c in results.get('clips', [])]
                self.next_cursor = results.get('nextCursor', '')
        return clips, msg
