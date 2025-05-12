import type { ApiChannel, ApiChannelsResponse, ChannelsResponse,
              ApiClip, ApiClipsResponse, ClipsResponse } from '$lib/types';

const CHANNELS_ENDPOINT = 'https://kick.com/api/search'
const CLIPS_ENDPOINT = 'https://kick.com/api/v2/channels'

function cleanQuery(query: string): string {
  return query.trim().replace(/[^a-zA-Z0-9_ ]/g, '');
}

function cleanChannelQuery(channel: string): string {
  return cleanQuery(channel).toLowerCase().replace(/\s+/g, ' ');
}

function cleanCursorQuery(cursor: string): string {
  return cleanQuery(cursor).replace(/\s+/g, '');
}

export async function searchChannels(query: string): Promise<ChannelsResponse> {
  let result: ChannelsResponse = [];
  const validQuery: string = cleanChannelQuery(query);
  if (validQuery.length < 3) return result;

  let apiRes: ApiChannelsResponse = {};
  const params: URLSearchParams = new URLSearchParams({'searched_word': validQuery});
  const requestUrl: string = `${CHANNELS_ENDPOINT}?${params}`;

  console.debug('fetching', requestUrl, '...');
  try {
    const response: Response = await fetch(requestUrl);
    console.debug(`fetch ended (${response.status}, ${response.statusText})`);

    if (response.ok) {
      apiRes = await response.json();
    } else {
      console.error(`Network response was not ok (${response.status})`);
    }
  } catch (error) {
    console.error(`Error fetching channels: ${error}`);
  }

  if (apiRes.channels) {
    result = apiRes.channels.map((channel: ApiChannel) => {
      return {
        slug: channel.slug ?? 'slug',
        followers: channel.followersCount ?? 0,
        name: channel.user?.username ?? 'name',
        avatar: channel.user?.profilePic ?? '',
        verified: !!channel.verified
      };
    });
  }

  return result;
}

export async function searchClips(channel: string, cursor: string): Promise<ClipsResponse> {
  let result: ClipsResponse = {clips: [], nextCursor: ''};
  const validChannel: string = cleanChannelQuery(channel);
  const validCursor: string = cleanCursorQuery(cursor);
  if (validChannel.length < 3) return result;

  let apiRes: ApiClipsResponse = {};
  let requestUrl: string = `${CLIPS_ENDPOINT}/${validChannel}/clips`;
  if (validCursor) {
    const params = new URLSearchParams({'cursor': validCursor});
    requestUrl += `?${params}`;
  }

  console.debug('fetching', requestUrl, '...');
  try {
    const response: Response = await fetch(requestUrl);
    console.debug(`fetch ended (${response.status}, ${response.statusText})`);

    if (response.ok) {
      apiRes = await response.json();
    } else {
      console.error(`Network response was not ok (${response.status})`);
    }
  } catch (error) {
    console.error(`Error fetching clips: ${error}`);
  }

  if (apiRes.clips) {
    result.clips = apiRes.clips.map((clip: ApiClip) => {
      let validDate: Date;
      try {
        validDate = new Date(clip.created_at ?? '');
      } catch (error) {
        console.error(`Error parsing date: ${error}`);
        validDate = new Date();
      }

      return {
        id: clip.id ?? 'id',
        title: clip.title ?? 'title',
        video: clip.clip_url ?? 'video',
        thumbnail: clip.thumbnail_url ?? 'thumbnail',
        views: clip.views ?? 0,
        duration: clip.duration ?? 0,
        date: validDate,
        creator: clip.creator?.username ?? '',
        channel: clip.channel?.slug ?? ''
      };
    });

    result.nextCursor = apiRes.nextCursor ?? '';
  } else {
    console.error('Invalid response format:', apiRes);
  }

  return result;
}