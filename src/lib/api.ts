import { notif } from './notifications';
import type { ApiChannel, ApiChannelsResponse, ChannelsResponse, ApiClip, ApiClipsResponse, ClipsResponse, SortType, ClipObject } from '$lib/types';

const API_ENDPOINT = new URL('https://kick.com/api/');

function cleanChannelQuery(channel: string): string {
  return channel
    .replace(/[^a-zA-Z0-9_ -]/g, '')
    .replace(/ +/g, ' ')
    .replace(/_+/g, '_')
    .replace(/-+/g, '-')
    .toLowerCase()
    .trim();
}

export async function searchChannels(query: string): Promise<ChannelsResponse> {
  const validQuery = cleanChannelQuery(query);
  let result: ChannelsResponse = [];

  if (validQuery.length < 3) return result;

  let apiRes: ApiChannelsResponse = {};
  const requestUrl = new URL('search', API_ENDPOINT);
  requestUrl.searchParams.append('searched_word', validQuery);

  try {
    const response = await fetch(requestUrl, {
      headers: { Accept: 'application/json' },
      method: 'GET',
    });

    if (response.ok) {
      apiRes = await response.json();
    } else {
      console.error(`Network response was not ok (${response.status})`);
    }
  } catch (error) {
    notif.error('Error searching for channels');
    console.error(`Error fetching channels: ${error}`);
  }

  if (apiRes.channels) {
    result = apiRes.channels.map((channel: ApiChannel) => {
      return {
        slug: channel.slug ?? 'slug',
        followers: channel.followersCount ?? 0,
        name: channel.user?.username ?? 'name',
        avatar: channel.user?.profilePic ?? '',
        verified: !!channel.verified,
      };
    });
  }
  return result;
}

export async function searchClips(channel: string, cursor: string, sort: SortType, startDate?: Date, endDate?: Date): Promise<ClipsResponse> {
  const allClips: ClipObject[] = [];

  const nextCursor = await searchInBatches(channel, cursor, sort, startDate, endDate, (clips) => allClips.push(...clips));

  return { clips: allClips, nextCursor };
}

export async function searchInBatches(
  channel: string,
  cursor: string,
  sort: SortType,
  startDate: Date | undefined,
  endDate: Date | undefined,
  onClips: (clips: ClipObject[]) => void,
): Promise<string> {
  const validChannel = cleanChannelQuery(channel);

  if (validChannel.length < 3) return '';

  const startUTC = new Date(startDate ?? '');
  startUTC.setHours(0, 0, 0, 0);
  const endUTC = new Date(endDate ?? '');
  endUTC.setHours(23, 59, 59, 999);

  if (!startDate || !endDate || sort === 'view') {
    const page = await fetchPage(validChannel, cursor, sort);
    const mappedClips = page.clips ? mapClips(page.clips) : [];
    onClips(mappedClips);
    return page.nextCursor ?? '';
  }

  let currentCursor = cursor;
  let reachedStartDate = false;

  while (!reachedStartDate) {
    const page = await fetchPage(validChannel, currentCursor, sort);

    if (!page.clips || page.clips.length === 0) {
      currentCursor = '';
      break;
    }

    const mappedClips = mapClips(page.clips);

    const filteredClips = mappedClips.filter((clip) => clip.date >= startUTC && clip.date <= endUTC);
    if (filteredClips.length > 0) {
      onClips(filteredClips);
    }

    const oldestClip = mappedClips[mappedClips.length - 1];
    const nextCursor = page.nextCursor ?? '';

    // Once we're past the range's start date, every older page is out of range too:
    // treat it as exhausted so the caller stops paginating instead of re-fetching forever.
    if (oldestClip.date < startUTC || !nextCursor) {
      reachedStartDate = true;
      currentCursor = '';
    } else {
      currentCursor = nextCursor;
    }
  }
  return currentCursor;
}

async function fetchPage(channel: string, cursor: string, sort: SortType): Promise<ApiClipsResponse> {
  const requestUrl = new URL(`v2/channels/${channel}/clips`, API_ENDPOINT);
  requestUrl.searchParams.append('sort', sort);

  if (cursor) {
    requestUrl.searchParams.append('cursor', cursor);
  }

  try {
    const response = await fetch(requestUrl, {
      headers: { Accept: 'application/json' },
      method: 'GET',
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Network response was not ok (${response.status})`);
    }
  } catch (error) {
    console.error(`Error fetching clips: ${error}`);
  }
  return {};
}

function mapClips(clips: ApiClip[]): ClipObject[] {
  return clips.map((clip: ApiClip) => {
    let validDate: Date;

    try {
      validDate = new Date(clip.created_at ?? '');
      if (isNaN(validDate.getTime())) throw new Error('Invalid');
    } catch {
      validDate = new Date();
    }

    return {
      id: clip.id ?? 'unknown',
      title: clip.title ?? 'Untitled',
      video: clip.clip_url ?? '',
      thumbnail: clip.thumbnail_url ?? '',
      views: clip.views ?? 0,
      duration: clip.duration ?? 0,
      date: validDate,
      creator: clip.creator?.username ?? '',
      channel: clip.channel?.slug ?? '',
    };
  });
}
