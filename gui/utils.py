from typing import Tuple, TypeVar, Union

from nicegui import ui
from nicegui.element import Element
from nicegui.elements.card import Card
from nicegui.elements.column import Column
from nicegui.elements.icon import Icon
from nicegui.elements.image import Image
from nicegui.elements.input import Input
from nicegui.elements.label import Label
from nicegui.elements.link import Link
from nicegui.elements.row import Row
from nicegui.elements.scroll_area import ScrollArea

from gui.constants import COLOR_PRIMARY, COLOR_SECONDARY

GuiElem = TypeVar('GuiElem', bound=Element)
GuiOpts = Union[Tuple[str, str], Tuple[str, str, str]]


def _build_element(e: GuiElem, opts: GuiOpts) -> GuiElem:
    p, c, *s = opts
    return e.props(p).classes(c).style(s[0] if s else '')


def build_element(opts: GuiOpts) -> Element:
    return _build_element(ui.element(), opts)


def build_card(opts: GuiOpts) -> Card:
    return _build_element(ui.card(), opts)


def build_column(opts: GuiOpts) -> Column:
    return _build_element(ui.column(), opts)


def build_icon(name: str, opts: GuiOpts) -> Icon:
    return _build_element(ui.icon(name), opts)


def build_image(source: str, opts: GuiOpts) -> Image:
    return _build_element(ui.image(source), opts)


def build_input(opts: GuiOpts) -> Input:
    return _build_element(ui.input(), opts)


def build_label(text: str, opts: GuiOpts) -> Label:
    return _build_element(ui.label(text), opts)


def build_link(target: str, opts: GuiOpts) -> Link:
    return _build_element(ui.link(target=target), opts)


def build_row(opts: GuiOpts) -> Row:
    return _build_element(ui.row(), opts)


def build_scroll_area(opts: GuiOpts) -> ScrollArea:
    return _build_element(ui.scroll_area(), opts)


def build_config(title: str) -> None:
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
