import type { Anime, Episode, JikanResponse } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const API_BASE = `${SUPABASE_URL}/functions/v1/godchair-api`;

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  apikey: SUPABASE_ANON_KEY,
};

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json: JikanResponse<T> = await res.json();
  return json.data;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ---- Anime data (cached Jikan proxy) ----

export async function getTopAnime(page = 1): Promise<Anime[]> {
  return apiGet<Anime[]>(`/top?page=${page}`);
}

export async function getSeasonNow(): Promise<Anime[]> {
  return apiGet<Anime[]>(`/season`);
}

export async function getUpcoming(): Promise<Anime[]> {
  return apiGet<Anime[]>(`/upcoming`);
}

export async function getAiring(): Promise<Anime[]> {
  return apiGet<Anime[]>(`/airing`);
}

export async function searchAnime(query: string, page = 1): Promise<Anime[]> {
  const q = encodeURIComponent(query);
  return apiGet<Anime[]>(`/search?q=${q}&page=${page}`);
}

export async function getAnimeById(id: number): Promise<Anime> {
  return apiGet<Anime>(`/anime/${id}`);
}

export async function getAnimeEpisodes(id: number): Promise<Episode[]> {
  try {
    return await apiGet<Episode[]>(`/episodes/${id}`);
  } catch {
    return [];
  }
}

export async function getRecommendations(id: number): Promise<{ entry: Anime }[]> {
  try {
    return await apiGet<{ entry: Anime }[]>(`/recommendations/${id}`);
  } catch {
    return [];
  }
}

export async function getAnimeByGenre(genreId: number, page = 1): Promise<Anime[]> {
  return apiGet<Anime[]>(`/genre/${genreId}?page=${page}`);
}

export async function getMatureAnime(page = 1): Promise<Anime[]> {
  return apiGet<Anime[]>(`/mature?page=${page}`);
}

// ---- Watch history ----

export interface HistoryEntry {
  id: string;
  device_id: string;
  mal_id: number;
  anime_title: string;
  anime_image: string;
  episode: number;
  watched_at: string;
}

export async function getHistory(deviceId: string): Promise<HistoryEntry[]> {
  const data = await apiGet<HistoryEntry[]>(`/history?device_id=${encodeURIComponent(deviceId)}`);
  return data || [];
}

export async function addHistory(
  deviceId: string,
  anime: { mal_id: number; title: string; image: string },
  episode: number,
): Promise<void> {
  await apiPost(`/history?device_id=${encodeURIComponent(deviceId)}`, {
    mal_id: anime.mal_id,
    anime_title: anime.title,
    anime_image: anime.image,
    episode,
  });
}

export async function clearHistory(deviceId: string): Promise<void> {
  await apiDelete(`/history?device_id=${encodeURIComponent(deviceId)}`);
}

// ---- Favorites ----

export interface FavoriteEntry {
  id: string;
  device_id: string;
  mal_id: number;
  anime_title: string;
  anime_image: string;
  created_at: string;
}

export async function getFavorites(deviceId: string): Promise<FavoriteEntry[]> {
  const data = await apiGet<FavoriteEntry[]>(`/favorites?device_id=${encodeURIComponent(deviceId)}`);
  return data || [];
}

export async function addFavorite(
  deviceId: string,
  anime: { mal_id: number; title: string; image: string },
): Promise<void> {
  await apiPost(`/favorites?device_id=${encodeURIComponent(deviceId)}`, {
    mal_id: anime.mal_id,
    anime_title: anime.title,
    anime_image: anime.image,
  });
}

export async function removeFavorite(deviceId: string, malId: number): Promise<void> {
  await apiDelete(`/favorites?device_id=${encodeURIComponent(deviceId)}&mal_id=${malId}`);
}

// ---- Genres ----

export interface GenreInfo {
  id: number;
  name: string;
}

export const GENRES: GenreInfo[] = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Adventure' },
  { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Supernatural' },
  { id: 41, name: 'Suspense' },
  { id: 7, name: 'Mystery' },
  { id: 14, name: 'Horror' },
  { id: 18, name: 'Mecha' },
  { id: 30, name: 'Sports' },
  { id: 62, name: 'Isekai' },
  { id: 19, name: 'Music' },
];
