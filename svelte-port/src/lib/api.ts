import type { ApiChannel, ApiChannelsResponse, ChannelsResponse,
              ApiClip, ApiClipsResponse, ClipsResponse } from '$lib/types';

const API_ENDPOINT = new URL('https://kick.com/api/');

function cleanChannelQuery(channel: string): string {
  return channel
    .replace(/[^a-zA-Z0-9_ -]/g, '')
    .replace(/ +/g, ' ')
    .replace(/_+/g, '_')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim()
}

function cleanClipQuery(cursor: string): string {
  return cursor
    .replace(/[^a-zA-Z0-9_]/g, '');
}

export async function searchChannels(query: string): Promise<ChannelsResponse> {
  const validQuery = cleanChannelQuery(query);
  let result: ChannelsResponse = [];
  if (validQuery.length < 3) return result;

  let apiRes: ApiChannelsResponse = {};
  const requestUrl = new URL('search', API_ENDPOINT);
  requestUrl.searchParams.append('searched_word', validQuery);

  console.debug('fetching', requestUrl, '...');
  try {
    const response = await fetch(requestUrl, {
      headers: { 'Accept': 'application/json' },
      method: 'GET'
    });
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
  const validChannel = cleanChannelQuery(channel);
  const validCursor = cleanClipQuery(cursor);
  let result: ClipsResponse = { clips: [], nextCursor: '' };
  if (validChannel.length < 3) return result;

  let apiRes: ApiClipsResponse = {};
  const requestUrl = new URL(`v2/channels/${validChannel}/clips`, API_ENDPOINT);
  if (validCursor) {
    requestUrl.searchParams.append('cursor', validCursor);
  }

  console.debug('fetching', requestUrl, '...');
  try {
    const response = await fetch(requestUrl, {
      headers: { 'Accept': 'application/json' },
      method: 'GET'
    });
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