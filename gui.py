from datetime import datetime as dt
from dateutil.tz import UTC
from dateutil.relativedelta import relativedelta

from nicegui import ui

from log import log

MAIN_PAGE = ('', 'w-full h-screen')
HEADER_IMAGE = ('', 'w-64 mt-32 self-center transition-all flex-shrink-0')
HEADER_LABEL = ('', 'self-center text-3xl font-medium mb-2 transition-all flex-shrink-0')
SEARCH_INPUT = ('placeholder="Search channel" input-class="ml-3" autofocus outlined item-aligned',
                'w-96 self-center transition-all font-bold text-lg text-gray-600 flex-shrink-0 my-16')
SEARCH_ICON = ('', 'self-center text-2xl text-secondary font-bold mr-2 flex-shrink-0')
RESULTS_ROW = ('', 'self-center gap-2')
RESULT_CARD = ('flat bordered',
               'border-gray-600 w-64 min-h-64 rounded-md gap-1 p-2 hover:bg-black hover:border-gray-400')
CHANNEL_IMAGE = ('bordered spinner-color="primary"',
                 'h-56 object-cover rounded-md border-2 border-gray-400 hover:border-[--q-primary]')
CHANNEL_LABEL = ('', 'self-center text-xl font-medium mt-2')
CHANNEL_ICON = ('', 'ml-1 mb-1 text-xl text-primary')
FOLLOWERS_LABEL = ('', 'self-center text-bold text-secondary')
CLIP_IMAGE = ('bordered spinner-color="primary"',
              'w-full object-cover rounded-md border-2 border-gray-400 hover:border-[--q-primary]')
DURATION_LABEL = ('', 'top-1 left-1 rounded-sm p-1')
VIEWS_LABEL = ('', 'font-bold right-1 bottom-1 rounded-sm')
VIEWS_ICON = ('', 'ml-1')
CLIP_LABEL = ('', 'text-xl/4 font-medium leading-none line-clamp-2 min-h-12')
CREATOR_LABEL = ('', 'text-primary')
DATE_ROW = ('', 'gap-1')
DATE_ICON = ('', 'text-xl text-secondary mt-1')
DATE_LABEL = ('', 'italic text-secondary mt-1')


LOGO_URL = 'https://kick.com/img/kick-logo.svg'
COLOR_PRIMARY = '#0F0'
COLOR_SECONDARY = '#667'

MIN_CARDS = 21

DATE_FORMAT = "%Y-%m-%dT%H:%M:%S.%f%z"


class Gui:
    def __init__(self, title):
        ui.page_title(title)
        ui.dark_mode(True)
        ui.colors(primary=COLOR_PRIMARY, secondary=COLOR_SECONDARY)

        self._cards = {}
        self._showing_clips = False
        self._get_more_clips = None

        ui.add_head_html("""
            <style>
                :root {
                    --nicegui-default-padding: 0;
                    --nicegui-default-gap: 0;
                }
            </style>
        """)

        with ui.column().classes(MAIN_PAGE[1]):
            self.logo = ui.image(LOGO_URL).classes(HEADER_IMAGE[1])
            ui.label('Clip Tool').classes(HEADER_LABEL[1])
            self.search_field = ui.input().props(SEARCH_INPUT[0]).classes(SEARCH_INPUT[1])
            with self.search_field:
                self.search_icon = ui.icon('search').classes(SEARCH_ICON[1])
            with ui.scroll_area(on_scroll=self._scroll_handler).classes('w-full h-full p-2 border') as sa:
                self.results = ui.row().classes('p-2 gap-1 h-full border')
                sa.bind_visibility_from(self.results)
            self.msg = ui.element().classes('self-center text-secondary')
        self.results.set_visibility(False)

    def set_search_handler(self, handler):
        self.search_field.on_value_change(handler)

    def set_more_clips(self, handler):
        self._get_more_clips = handler

    async def _scroll_handler(self, e):
        if self._showing_clips and e.vertical_percentage == 1:
            if self._get_more_clips:
                await self._get_more_clips()

    def begin_search(self):
        self.logo.classes(add='mt-32', remove='mt-8')
        self.search_field.classes(add='my-16', remove='my-4')
        self.search_icon.set_visibility(False)
        self.search_field.props(add='loading')
        self.results.set_visibility(False)
        self.results.clear()
        self._cards.clear()
        self.msg.set_visibility(False)
        self.msg.clear()
        self._showing_clips = False

    def end_search(self):
        self.search_field.props(remove='loading')
        self.search_icon.set_visibility(True)
        if self._cards:
            self.results.set_visibility(True)
            self.logo.classes(add='mt-8', remove='mt-32')
            self.search_field.classes(add='my-4', remove='my-16')

    def show_message(self, msg):
        self.msg.clear()
        with self.msg:
            ui.label(msg).classes('text-2xl font-lg bold')
        self.msg.set_visibility(True)

    def _show_channels(self, channels, handler):
        async def _on_click_card(e, handler):
            slug, name = self._cards.get(e.sender.id, -1)
            self.search_field.props(f'value="{name}"')
            await handler(slug)

        def _build_card(channel, handler):
            avatar, followers, name, _, verified = channel
            card = ui.card().props(RESULT_CARD[0]).classes(RESULT_CARD[1]) \
                .on('click', lambda e: _on_click_card(e, handler))
            with card:
                ui.image(avatar).props(CHANNEL_IMAGE[0]).classes(CHANNEL_IMAGE[1])
                channel_label = ui.label(name).classes(CHANNEL_LABEL[1])
                if verified:
                    with channel_label:
                        ui.icon('verified').classes(CHANNEL_ICON[1])
                ui.label(f'{followers} followers').classes(FOLLOWERS_LABEL[1])
            return card.id

        for c in channels:
            card_id = _build_card(c, handler)
            self._cards.update({card_id: (c.slug, c.name)})

    def _show_clips(self, clips):
        def _on_click_card(e):
            url = self._cards.get(e.sender.id, -1)
            log.debug('clicked %s', url)

        def _build_card(clip):
            creator, date, duration, thumbnail, title, url, views = clip
            card = ui.card().props(RESULT_CARD[0]).classes(RESULT_CARD[1] + ' flex flex-shrink-0') \
                .on('click', _on_click_card)
            with card:
                with ui.link(target=url).classes('w-full'):
                    with ui.image(thumbnail).props(CLIP_IMAGE[0]).classes(CLIP_IMAGE[1]):
                        mins, secs = str(duration // 60).rjust(2, '0'), str(duration % 60).rjust(2, '0')
                        ui.label(f'{mins}:{secs}').classes(DURATION_LABEL[1]).style('padding: 5px;')
                        with ui.label(f'{views}').classes(VIEWS_LABEL[1]).style('padding: 5px;'):
                            ui.icon('visibility').classes(VIEWS_ICON[1])
                ui.label(title).classes(CLIP_LABEL[1])
                ui.label(creator).classes(CREATOR_LABEL[1])
                with ui.row().props(DATE_ROW[0]):
                    ui.icon('date_range').classes(DATE_ICON[1])
                    now, created_at = dt.now(UTC), dt.strptime(date, DATE_FORMAT)
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
                    ui.label(f'{v} {u} ago').classes(DATE_LABEL[1])
            return card.id

        for c in clips:
            card_id = _build_card(c)
            self._cards.update({card_id: c.url})

    def show_channels(self, values, handler):
        with self.results:
            self._show_channels(values, handler)

    async def show_clips(self, values):
        self._showing_clips = True
        with self.results:
            self._show_clips(values)
        if len(self._cards) < MIN_CARDS:
            if self._get_more_clips:
                await self._get_more_clips()
