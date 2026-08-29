export interface AnimeImage {
  jpg: { image_url: string; small_image_url: string; large_image_url: string };
  webp: { image_url: string; small_image_url: string; large_image_url: string };
}

export interface AnimeTitle {
  type: string;
  title: string;
}

export interface AnimeGenre {
  mal_id: number;
  name: string;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: AnimeImage;
  trailer?: { youtube_id?: string; url?: string; embed_url?: string };
  title: string;
  title_english?: string;
  title_japanese?: string;
  titles?: AnimeTitle[];
  type?: string;
  source?: string;
  episodes?: number;
  status?: string;
  airing?: boolean;
  duration?: string;
  rating?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  synopsis?: string;
  background?: string;
  season?: string;
  year?: number;
  studios?: { mal_id: number; name: string }[];
  genres?: AnimeGenre[];
  themes?: AnimeGenre[];
  demographics?: AnimeGenre[];
  aired?: { string?: string; from?: string; to?: string };
}

export interface Episode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese?: string;
  title_romanji?: string;
  aired?: string;
  score?: number;
  filler?: boolean;
  recap?: boolean;
  forum_url?: string;
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items?: { count: number; total: number; per_page: number };
  };
}

export type View =
  | { name: 'home' }
  | { name: 'search'; query?: string }
  | { name: 'detail'; id: number }
  | { name: 'watch'; id: number; episode?: number }
  | { name: 'season' }
  | { name: 'top' }
  | { name: 'mature' }
  | { name: 'genre'; genre: string };
