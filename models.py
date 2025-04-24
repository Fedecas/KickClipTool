from typing import NamedTuple
from random import choice


default_avatars = [
    f'https://kick.com/img/default-profile-pictures/default{n}.jpeg'
    for n in range(1, 7)
]

Channel = NamedTuple('Channel', [
    ('avatar', str),
    ('followers', int),
    ('name', str),
    ('slug', str),
    ('verified', bool)
])

Clip = NamedTuple('Clip', [
    ('creator', str),
    ('date', str),
    ('duration', int),
    ('thumbnail', str),
    ('title', str),
    ('url', str),
    ('views', int)
])


def channel_from_dict(data: dict) -> Channel:
    user = data.get('user', {})
    return Channel(
        avatar=user.get('profilePic', choice(default_avatars)),
        followers=data.get('followersCount', 0),
        name=user.get('username', ''),
        slug=data.get('slug', ''),
        verified=data.get('verified', None) is not None
    )


def clip_from_dict(data: dict) -> Clip:
    channel = data.get('channel', {}).get('slug', '')
    c_id = data.get('id', '')
    return Clip(
        creator=data.get('creator', {}).get('username', ''),
        date=data.get('created_at', ''),
        duration=data.get('duration', 0),
        thumbnail=data.get('thumbnail_url', ''),
        title=data.get('title', ''),
        url=f'https://kick.com/{channel}/clips/{c_id}',  # data.get('clip_url', ''),
        views=data.get('views', 0)
    )
