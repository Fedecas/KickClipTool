from dataclasses import dataclass
from random import choice


default_avatars = [
    f'https://kick.com/img/default-profile-pictures/default{n}.jpeg'
    for n in range(1, 7)
]


@dataclass
class Channel:
    avatar: str
    followers: int
    name: str
    slug: str
    verified: bool

    @classmethod
    def from_dict(cls, data):
        user = data.get('user', {})
        return cls(
            avatar=user.get('profilePic', choice(default_avatars)),
            followers=data.get('followersCount', 0),
            name=user.get('username', ''),
            slug=data.get('slug', ''),
            verified=data.get('verified', None) is not None
        )

    def __iter__(self):
        return iter(
            (self.avatar, self.followers, self.name, self.slug, self.verified)
        )


@dataclass
class Clip:
    creator: str
    date: str
    duration: int
    thumbnail: str
    title: str
    url: str
    views: int

    @classmethod
    def from_dict(cls, data):
        return cls(
            creator=data.get('creator', {}).get('username', ''),
            date=data.get('created_at', ''),
            duration=data.get('duration', 0),
            thumbnail=data.get('thumbnail_url', ''),
            title=data.get('title', ''),
            url=data.get('clip_url', ''),
            views=data.get('views', 0)
        )

    def __iter__(self):
        return iter(
            (self.creator, self.date, self.duration, self.thumbnail, self.title, self.url, self.views)
        )
