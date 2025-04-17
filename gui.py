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
RESULTS_AREA = ('', 'w-full h-full p-2 border')
RESULTS_ROW = ('', 'p-2 gap-1 h-full border')
RESULT_CARD = ('flat bordered',
               'border-gray-600 w-64 min-h-64 rounded-md gap-1 p-2 flex flex-shrink-0 hover:bg-black hover:border-gray-400')
CHANNEL_IMAGE = ('bordered spinner-color="primary"',
                 'h-56 object-cover rounded-md border-2 border-gray-400 hover:border-[--q-primary]')
CHANNEL_LABEL = ('', 'self-center text-xl font-medium mt-2')
CHANNEL_ICON = ('', 'ml-1 mb-1 text-xl text-primary')
FOLLOWERS_LABEL = ('', 'self-center text-bold text-secondary')
CLIP_LINK = ('', 'size-full')
CLIP_IMAGE = ('bordered spinner-color="primary"',
              'w-full object-cover rounded-md border-2 border-gray-400 hover:border-[--q-primary]')
DURATION_LABEL = ('', 'top-1 left-1 rounded-sm p-1',
                  'padding: 5px;')
VIEWS_LABEL = ('', 'font-bold right-1 bottom-1 rounded-sm',
               'padding: 5px;')
VIEWS_ICON = ('', 'ml-1')
CLIP_LABEL = ('', 'text-xl/4 font-medium leading-none line-clamp-2 min-h-12')
CREATOR_LABEL = ('', 'text-primary')
DATE_ROW = ('', 'gap-1')
DATE_ICON = ('', 'text-xl text-secondary mt-1')
DATE_LABEL = ('', 'italic text-secondary mt-1')
MESSAGE_ELEMENT = ('', 'self-center text-secondary')
MESSAGE_LABEL = ('', 'text-2xl font-lg bold')


LOGO_URL = 'https://kick.com/img/kick-logo.svg'
COLOR_PRIMARY = '#0F0'
COLOR_SECONDARY = '#667'

MIN_CARDS = 21

DATE_FORMAT = "%Y-%m-%dT%H:%M:%S.%f%z"


def build_element(e, opts):
    if not e:
        e = ui.element()
    p, c, *s = opts
    return e.props(p).classes(c).style(s[0] if s else '')


def build_label(text, opts):
    return build_element(ui.label(text), opts)


def build_image(source, opts):
    return build_element(ui.image(source), opts)


def build_input(opts):
    return build_element(ui.input(), opts)


def build_icon(name, opts):
    return build_element(ui.icon(name), opts)


def build_scroll_area(opts):
    return build_element(ui.scroll_area(), opts)


def build_row(opts):
    return build_element(ui.row(), opts)


def build_card(opts):
    return build_element(ui.card(), opts)


def build_link(target, opts):
    return build_element(ui.link(target=target), opts)


def build_column(opts):
    return build_element(ui.column(), opts)


def build_config(title):
    ui.page_title(title)
    ui.dark_mode(True)
    ui.colors(primary=COLOR_PRIMARY, secondary=COLOR_SECONDARY)
    ui.add_head_html("""
        <style>
            :root {
                --nicegui-default-padding: 0;
                --nicegui-default-gap: 0;
            }
        </style>
    """)


class GuiMessage:
    def __init__(self):
        self.msg = build_element(None, MESSAGE_ELEMENT)

    def clear(self):
        self.msg.set_visibility(False)
        self.msg.clear()

    def write(self, msg):
        self.msg.clear()
        with self.msg:
            build_label(msg, MESSAGE_LABEL)
        self.msg.set_visibility(True)


class GuiResults:
    def __init__(self, scroll_handler):
        with build_scroll_area(RESULTS_AREA) as scroll_area:
            self.results = build_row(RESULTS_ROW)
            scroll_area.on_scroll(scroll_handler)
            scroll_area.bind_visibility_from(self.results)
        self.results.set_visibility(False)

    def set_loading(self, loading):
        if loading:
            self.results.set_visibility(False)
            self.results.clear()
        else:
            self.results.set_visibility(True)

    def __enter__(self):
        return self.results.__enter__()

    def __exit__(self, *_):
        return self.results.__exit__(*_)


class GuiHeader:
    def __init__(self):
        self.logo = build_image(LOGO_URL, HEADER_IMAGE)
        build_label('Clip Tool', HEADER_LABEL)
        self.search_field = build_input(SEARCH_INPUT)
        with self.search_field:
            self.search_icon = build_icon('search', SEARCH_ICON)

    def set_search_handler(self, handler):
        self.search_field.on_value_change(handler)

    def set_loading(self, loading, found_results=False):
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

    def set_search_value(self, value):
        self.search_field.props(f'value="{value}"')


class Gui:
    def __init__(self, title):
        build_config(title)

        with build_column(MAIN_PAGE):
            self.header = GuiHeader()
            self.results = GuiResults(self._scroll_handler)
            self.message = GuiMessage()

        self._cards = {}
        self._showing_clips = False
        self._get_more_clips = None

    def set_search_handler(self, handler):
        self.header.set_search_handler(handler)

    def set_more_clips(self, handler):
        self._get_more_clips = handler

    async def _scroll_handler(self, e):
        if self._showing_clips and e.vertical_percentage == 1:
            if self._get_more_clips:
                await self._get_more_clips()

    def begin_search(self):
        self.header.set_loading(True)
        self.results.set_loading(True)
        self.message.clear()

        self._cards.clear()
        self._showing_clips = False

    def end_search(self):
        found_results = len(self._cards) > 0
        self.header.set_loading(False, found_results)
        if found_results:
            self.results.set_loading(False)

    def show_message(self, msg):
        self.message.write(msg)

    def _show_channels(self, channels, handler):
        async def _on_click_card(e, handler):
            slug, name = self._cards.get(e.sender.id, ('', ''))
            self.header.set_search_value(name)
            await handler(slug)

        def _build_card(channel, handler):
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
            self._cards.update({card_id: (c.slug, c.name)})

    def _show_clips(self, clips):
        def _on_click_card(e):
            url = self._cards.get(e.sender.id, '')
            log.debug('clicked %s', url)

        def _build_views(views):
            with build_label(f'{views}', VIEWS_LABEL):
                build_icon('visibility', VIEWS_ICON)

        def _build_duration(duration):
            mins, secs = duration // 60, duration % 60
            build_label(f'{mins:0>2}:{secs:0>2}', DURATION_LABEL)

        def _build_card_image(url, thumbnail, duration, views):
            with build_link(url, CLIP_LINK):
                with build_image(thumbnail, CLIP_IMAGE):
                    _build_duration(duration)
                    _build_views(views)

        def _build_date_label(date):
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
            build_label(f'{v} {u} ago', DATE_LABEL)

        def _build_card_date(date):
            with build_row(DATE_ROW):
                build_icon('date_range', DATE_ICON)
                _build_date_label(date)

        def _build_card(clip):
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
