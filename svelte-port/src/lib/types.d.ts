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

export interface ApiClipsResponse {
  clips?: ApiClip[];
  nextCursor?: string;
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

export interface ClipsResponse {
  clips: ClipObject[];
  nextCursor: string;
};

export interface ClipRef {
  id: string;
  title: string;
  video: string;
  thumbnail: string;
  channel: string;
};