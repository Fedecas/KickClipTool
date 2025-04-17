from nicegui import ui

from gui.constants import COLOR_PRIMARY, COLOR_SECONDARY


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
