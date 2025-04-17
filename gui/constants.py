# HTML style constants
MAIN_PAGE = ('', 'w-full h-screen')
HEADER_IMAGE = ('', 'w-64 mt-32 self-center transition-all flex-shrink-0')
HEADER_LABEL = ('', 'self-center text-3xl font-medium mb-2 transition-all flex-shrink-0')
SEARCH_INPUT = ('placeholder="Search channel" input-class="ml-3" autofocus outlined item-aligned',
                'w-96 self-center transition-all font-bold text-lg text-gray-600 flex-shrink-0 my-16')
SEARCH_ICON = ('', 'self-center text-2xl text-secondary font-bold mr-2 flex-shrink-0')
RESULTS_AREA = ('', 'w-full h-full p-2 border')
RESULTS_ROW = ('', 'p-2 gap-1 h-full border')
RESULT_CARD = ('flat bordered',
               'border-gray-600 w-64 min-h-64 rounded-md gap-1 p-2 flex flex-shrink-0'
               ' hover:bg-black hover:border-gray-400')
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

# Design constants
LOGO_URL = 'https://kick.com/img/kick-logo.svg'
COLOR_PRIMARY = '#0F0'
COLOR_SECONDARY = '#667'

# Aux constants
MIN_CARDS = 21
DATE_FORMAT = "%Y-%m-%dT%H:%M:%S.%f%z"
