from asyncio import create_task, sleep
from asyncio.exceptions import CancelledError
from typing import Tuple, Optional, Dict, List

from curl_cffi import AsyncSession
from curl_cffi.requests.models import Response
from curl_cffi.requests.exceptions import Timeout, DNSError

from api.constants import SEARCH_ENDPOINT, CLIPS_ENDPOINT, DEBOUNCE_TIME

from models import Channel, Clip, channel_from_dict, clip_from_dict
from log import log


class Api:
    def __init__(self) -> None:
        self.session = AsyncSession()
        self.running_query = None
        self.last_channel = ''
        self.last_cursor = ''
        self.next_cursor = ''

    async def _clean_current_task(self) -> None:
        current = self.running_query
        if current and not current.done():
            current.cancel()
            try:
                await current
            except CancelledError:
                log.debug('cancelling %s...', current.get_name())

    async def _debounced_search(self,
                                url: str,
                                headers: Optional[Dict[str, str]] = None,
                                params: Optional[Dict[str, str]] = None) -> Optional[Response]:
        headers = headers or {}
        params = params or {}
        await sleep(DEBOUNCE_TIME)
        result = None
        try:
            result = await self.session.get(url, headers=headers, params=params, impersonate='chrome')
        except Timeout:
            log.warning('timeout for %s', (url, headers, params))
            raise
        except DNSError:
            log.warning('could not resolve host for %s', (url, headers, params))
            raise
        except Exception as exc:
            log.error('unhandled exception "%s" in request %s', str(exc), (url, headers, params))
            raise
        return result

    async def _get_content(self,
                           url: str,
                           headers: Optional[Dict[str, str]] = None,
                           params: Optional[Dict[str, str]] = None) -> Tuple[Dict, str]:
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
        except Exception as exc:
            log.error('unhandled exception "%s" in request %s', str(exc), (url, headers, params))
            raise
        finally:
            self.running_query = None

        if response:
            if response.status_code in range(200, 300):
                content = response.json()
            else:
                log.error('Response code %d: %s', response.status_code, str(response.content)[:100])
                msg = str(response.status_code)
        else:
            msg = 'no response'

        return content, msg

    async def get_channels(self, word: str) -> Tuple[List[Channel], str]:
        url = SEARCH_ENDPOINT
        params = {'searched_word': word}
        results, msg = await self._get_content(url, params=params)
        channels = []
        if not msg:
            channels = [channel_from_dict(c) for c in results.get('channels', [])]
        return channels, msg

    async def get_clips(self, channel: str) -> Tuple[List[Clip], str]:
        do_request = True
        clips, msg = [], ''
        url = f'{CLIPS_ENDPOINT}/{channel}/clips'
        params = {'sort': 'date', 'range': 'all'}
        if channel == self.last_channel:
            if self.next_cursor:
                if self.last_cursor == self.next_cursor:
                    do_request = False
                    log.debug('same query from last time, skipping...')
                else:
                    params.update({'cursor': self.next_cursor})
            else:
                do_request = False
                # msg = 'end of chain'
                log.debug('there is no more clips for "%s"', channel)
        else:
            self.last_channel = channel

        if do_request:
            self.last_cursor = self.next_cursor
            results, msg = await self._get_content(url, params=params)
            if not msg:
                clips = [clip_from_dict(c) for c in results.get('clips', [])]
                self.next_cursor = results.get('nextCursor', '')
        return clips, msg
