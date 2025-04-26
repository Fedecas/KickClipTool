from nicegui import ui

from api.api import Api
from gui.gui import Gui
from gui.events import ValueChangeEvent
from log import log

TITLE = 'Kick Clip Tool'


class App:
    def __init__(self) -> None:
        self.api = Api()
        self.gui = Gui(TITLE)
        self.gui.set_search_handler(self.search_channel)
        self.gui.set_more_clips(self.more_clips)

        self.last_channel = ''

    async def search_channel(self, e: ValueChangeEvent) -> None:
        self.gui.begin_search()
        word = e.value.strip()
        if word:
            log.debug('searching for "%s"...', word)
            channels, msg = await self.api.get_channels(word)
            if msg:
                self.gui.show_message(f'UPS: {msg}')
                log.warning('UPS: %s', msg)
            elif channels:
                self.gui.show_channels(channels, self.search_clips)
            else:
                self.gui.show_message('no results found')
                log.debug('no results found')
        self.gui.end_search()

    async def search_clips(self, channel: str) -> None:
        self.last_channel = channel
        self.gui.begin_search()
        log.debug('searching clips for "%s"...', channel)
        clips, msg = await self.api.get_clips(channel)
        if msg:
            self.gui.show_message(f'UPS: {msg}')
        elif clips:
            await self.gui.show_clips(clips)
        else:
            self.gui.show_message('no results found')
        self.gui.end_search()

    async def more_clips(self) -> None:
        log.debug('more clips for "%s"...', self.last_channel)
        clips, msg = await self.api.get_clips(self.last_channel)
        if msg:
            self.gui.show_message(f'UPS: {msg}')
        elif clips:
            await self.gui.show_clips(clips)

    def run(self) -> None:
        ui.run(title=TITLE, favicon='favicon.ico',
               # native=True, window_size=(1280, 720), reload=False,
               uvicorn_reload_excludes='__pycache__/*', uvicorn_logging_level='warning',
               show_welcome_message=False)


if __name__ in {"__main__", "__mp_main__"}:
    app = App()
    app.run()
