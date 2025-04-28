from datetime import datetime as dt
from typing import Callable, List

from dateutil.relativedelta import relativedelta
from dateutil.tz import UTC

from gui.constants import (
    MESSAGE_ELEMENT, MESSAGE_LABEL, RESULTS_AREA, RESULTS_ROW, LOGO_URL,
    CHANNEL_IMAGE, CHANNEL_LABEL, CHANNEL_ICON, FOLLOWERS_LABEL, CLIP_LINK,
    CLIP_IMAGE, DURATION_LABEL, VIEWS_LABEL, VIEWS_ICON, CLIP_LABEL,
    CREATOR_LABEL, DATE_ROW, DATE_ICON, DATE_LABEL, RESULT_CARD, SEARCH_INPUT,
    SEARCH_ICON, HEADER_IMAGE, HEADER_LABEL, MAIN_PAGE, MIN_CARDS
)
from gui.utils import (
    Row,
    build_card, build_column, build_config, build_element, build_icon,
    build_image, build_input, build_label, build_link, build_row, build_scroll_area
)
from gui.events import ScrollEvent, GenericEvent
from models import Channel, Clip

from log import log


class GuiMessage:
    def __init__(self) -> None:
        self.msg = build_element(MESSAGE_ELEMENT)

    def clear(self) -> None:
        self.msg.set_visibility(False)
        self.msg.clear()

    def write(self, msg: str) -> None:
        self.msg.clear()
        with self.msg:
            build_label(msg, MESSAGE_LABEL)
        self.msg.set_visibility(True)


class GuiResults:
    def __init__(self, scroll_handler: Callable) -> None:
        with build_scroll_area(RESULTS_AREA) as scroll_area:
            self.results = build_row(RESULTS_ROW)
            scroll_area.on_scroll(scroll_handler)
            scroll_area.bind_visibility_from(self.results)
        self.results.set_visibility(False)

    def set_loading(self, loading) -> None:
        if loading:
            self.results.set_visibility(False)
            self.results.clear()
        else:
            self.results.set_visibility(True)

    def __enter__(self) -> Row:
        return self.results.__enter__()

    def __exit__(self, *_) -> None:
        return self.results.__exit__(*_)


class GuiHeader:
    def __init__(self) -> None:
        self.logo = build_image(LOGO_URL, HEADER_IMAGE)
        build_label('Clip Tool', HEADER_LABEL)
        self.search_field = build_input(SEARCH_INPUT)
        with self.search_field:
            self.search_icon = build_icon('search', SEARCH_ICON)

    def set_search_handler(self, handler: Callable) -> None:
        self.search_field.on_value_change(handler)

    def set_loading(self, loading: bool, found_results: bool = False) -> None:
        if loading:
            self.logo.classes(add='mt-32', remove='mt-8')
            self.search_field.props(add='loading')
            self.search_field.classes(add='my-16', remove='my-4')
            self.search_icon.set_visibility(False)
        else:
            self.search_field.props(remove='loading')
            self.search_icon.set_visibility(True)
            if found_results:
                self.logo.classes(add='mt-8', remove='mt-32')
                self.search_field.classes(add='my-4', remove='my-16')

    def set_search_value(self, value: str) -> None:
        self.search_field.props(f'value="{value}"')


class Gui:
    def __init__(self, title: str) -> None:
        build_config(title)

        with build_column(MAIN_PAGE):
            self.header = GuiHeader()
            self.results = GuiResults(self._scroll_handler)
            self.message = GuiMessage()

        self.cards = {}
        self.showing_clips = False
        self._get_more_clips = None

    def set_search_handler(self, handler: Callable) -> None:
        self.header.set_search_handler(handler)

    def set_more_clips(self, handler: Callable) -> None:
        self._get_more_clips = handler

    async def _scroll_handler(self, e: ScrollEvent) -> None:
        if self.showing_clips and e.vertical_percentage == 1:
            if self._get_more_clips:
                await self._get_more_clips()

    def begin_search(self) -> None:
        self.header.set_loading(True)
        self.results.set_loading(True)
        self.message.clear()

        self.cards.clear()
        self.showing_clips = False

    def end_search(self) -> None:
        found_results = len(self.cards) > 0
        self.header.set_loading(False, found_results)
        if found_results:
            self.results.set_loading(False)

    def show_message(self, msg: str) -> None:
        self.message.write(msg)

    def _show_channels(self, channels: List[Channel], handler: Callable) -> None:
        async def _on_click_card(e: GenericEvent, handler: Callable) -> None:
            slug, name = self.cards.get(e.sender.id, ('', ''))
            self.header.set_search_value(name)
            await handler(slug)

        def _build_card(channel: Channel, handler: Callable) -> int:
            avatar, followers, name, _, verified = channel
            card = build_card(RESULT_CARD)
            card.on('click', lambda e: _on_click_card(e, handler))
            with card:
                build_image(avatar, CHANNEL_IMAGE)
                channel_label = build_label(name, CHANNEL_LABEL)
                if verified:
                    with channel_label:
                        build_icon('verified', CHANNEL_ICON)
                build_label(f'{followers} followers', FOLLOWERS_LABEL)
            return card.id

        for c in channels:
            card_id = _build_card(c, handler)
            self.cards.update({card_id: (c.slug, c.name)})

    def _show_clips(self, clips: List[Clip]) -> None:
        def _on_click_card(e: GenericEvent) -> None:
            url = self.cards.get(e.sender.id, '')
            log.debug('clicked %s', url)

        def _build_views(views: int) -> None:
            with build_label(f'{views}', VIEWS_LABEL):
                build_icon('visibility', VIEWS_ICON)

        def _build_duration(duration: int) -> None:
            mins, secs = duration // 60, duration % 60
            build_label(f'{mins:0>2}:{secs:0>2}', DURATION_LABEL)

        def _build_card_image(url: str, thumbnail: str, duration: int, views: int) -> None:
            with build_link(url, CLIP_LINK):
                with build_image(thumbnail, CLIP_IMAGE):
                    _build_duration(duration)
                    _build_views(views)

        def _build_date_label(date: str) -> None:
            now = dt.now(UTC)
            created_at = dt.fromisoformat(date.replace('Z', '+00:00'))
            delta = relativedelta(now, created_at)
            v, u = delta.seconds, 'seconds'
            if delta.years > 0:
                v, u = delta.years, 'years'
            elif delta.months > 0:
                v, u = delta.months, 'months'
            elif delta.days > 0:
                v, u = delta.days, 'days'
            elif delta.hours > 0:
                v, u = delta.hours, 'hours'
            elif delta.minutes > 0:
                v, u = delta.minutes, 'minutes'
            build_label(f'{v} {u} ago', DATE_LABEL)

        def _build_card_date(date: str) -> None:
            with build_row(DATE_ROW):
                build_icon('date_range', DATE_ICON)
                _build_date_label(date)

        def _build_card(clip: Clip) -> int:
            creator, date, duration, thumbnail, title, url, views = clip
            card = build_card(RESULT_CARD)
            card.on('click', _on_click_card)
            with card:
                _build_card_image(url, thumbnail, duration, views)
                build_label(title, CLIP_LABEL)
                build_label(creator, CREATOR_LABEL)
                _build_card_date(date)
            return card.id

        for c in clips:
            card_id = _build_card(c)
            self.cards.update({card_id: c.url})

    def show_channels(self, values: List[Channel], handler: Callable) -> None:
        with self.results:
            self._show_channels(values, handler)

    async def show_clips(self, values: List[Clip]) -> None:
        self.showing_clips = True
        with self.results:
            self._show_clips(values)
        if len(self.cards) < MIN_CARDS:
            if self._get_more_clips:
                await self._get_more_clips()
