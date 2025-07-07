export interface ApiChannel {
  id?: number;
  user_id?: number;
  slug?: string;
  is_banned?: boolean;
  playback_url?: string;
  name_updated_at?: string | null;
  vod_enabled?: boolean;
  subscription_enabled?: boolean;
  is_affiliate?: boolean;
  is_live?: boolean;
  followers_count?: number;
  viewer_count_ivs?: number;
  last_activity_at?: string;
  viewer_count_ws?: number;
  viewer_count?: number;
  userId?: number;
  followersCount?: number;
  following?: boolean;
  subscription?: boolean;
  isLive?: boolean;
  recentCategories?: string[];
  can_host?: boolean;
  user?: {
    id?: number;
    username?: string;
    agreed_to_terms?: boolean;
    email_verified_at?: string;
    bio?: string | null;
    profilePic?: string | null;
  };
  verified?: {
    id?: number;
    channel_id?: number;
    created_at?: string;
    updated_at?: string;
  } | null;
}

export interface ApiClip {
  id?: string;
  livestream_id?: string;
  category_id?: string;
  channel_id?: number;
  user_id?: number;
  title?: string;
  clip_url?: string;
  thumbnail_url?: string;
  privacy?: string;
  likes?: number;
  liked?: boolean;
  views?: number;
  duration?: number;
  started_at?: string;
  created_at?: string;
  vod_starts_at?: number;
  is_mature?: boolean;
  video_url?: string;
  view_count?: number;
  likes_count?: number;
  category?: {
    id?: number;
    name?: string;
    slug?: string;
    parent_category?: string;
  };
  creator?: {
    id?: number;
    username?: string;
    slug?: string;
  };
  channel?: {
    id?: number;
    username?: string;
    slug?: string;
    profile_picture?: string;
  };
}

export interface ApiChannelsResponse {
  channels?: ApiChannel[];
  categories?: any[];
}

export interface ApiClipsResponse {
  clips?: ApiClip[];
  nextCursor?: string;
}

export interface ChannelObject {
  slug: string;
  followers: number;
  name: string;
  avatar: string;
  verified: boolean;
}

export interface ClipObject {
  id: string;
  title: string;
  video: string;
  thumbnail: string;
  views: number;
  duration: number;
  date: Date;
  creator: string;
  channel: string;
};

export type ChannelsResponse = ChannelObject[];

export interface ClipsResponse {
  clips: ClipObject[];
  nextCursor: string;
};

export type SortType = 'date' | 'view';
