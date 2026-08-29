import { useEffect, useState } from 'react';
import { getTopAnime, getSeasonNow, getUpcoming, getAiring, getFavorites, getHistory } from '@/lib/api';
import type { Anime } from '@/lib/types';
import type { FavoriteEntry, HistoryEntry } from '@/lib/api';
import { AnimeRow } from '@/components/AnimeRow';
import { LoadingState, SectionHeader } from '@/components/LoadingState';
import { navigate, pushNotification, getDeviceId } from '@/lib/store';
import { ChevronRight, TrendingUp, Calendar, Radio, Clock, Heart, History } from 'lucide-react';

export function HomePage() {
  const [top, setTop] = useState<Anime[]>([]);
  const [seasonal, setSeasonal] = useState<Anime[]>([]);
  const [upcoming, setUpcoming] = useState<Anime[]>([]);
  const [airing, setAiring] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [t, s, a] = await Promise.all([getTopAnime(), getSeasonNow(), getAiring()]);
        setTop(t);
        setSeasonal(s);
        setAiring(a);
        const u = await getUpcoming();
        setUpcoming(u);
        setLoading(false);
      } catch {
        setLoading(false);
      }
      // Load favorites + history
      const did = getDeviceId();
      getFavorites(did).then(setFavorites).catch(() => {});
      getHistory(did).then(setHistory).catch(() => {});
    })();
  }, []);

  useEffect(() => {
    pushNotification({
      title: 'System Online',
      message: 'Welcome, Player. The GodChair awaits your command.',
      type: 'success',
    });
  }, []);

  if (loading) return <LoadingState message="Initializing System Interface..." />;

  return (
    <div className="space-y-12 pb-12">
      {/* Hero featured */}
      {top[0] && <HeroSection anime={top[0]} />}

      {/* Continue watching */}
      {history.length > 0 && (
        <section>
          <SectionHeader title="Continue Watching" subtitle="Your recent viewing activity" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.slice(0, 12).map((h) => (
              <button
                key={h.id}
                onClick={() => navigate(`/watch/${h.mal_id}/${h.episode}`)}
                className="card-glow group relative text-left animate-slide-up"
              >
                <div className="relative overflow-hidden border border-system-border bg-system-dark aspect-video">
                  <img src={h.anime_image} alt={h.anime_title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-system-bg to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white font-mono truncate">{h.anime_title}</p>
                    <p className="text-[10px] text-system-dim">Ep {h.episode}</p>
                  </div>
                  <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
                    <History size={10} className="text-system-cyan" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <section>
          <SectionHeader title="My Favorites" subtitle="Your favorited archives" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {favorites.slice(0, 12).map((f) => (
              <button
                key={f.id}
                onClick={() => navigate(`/anime/${f.mal_id}`)}
                className="card-glow group relative text-left animate-slide-up"
              >
                <div className="relative overflow-hidden border border-system-border bg-system-dark aspect-[2/3]">
                  <img src={f.anime_image} alt={f.anime_title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-system-bg to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white font-mono truncate">{f.anime_title}</p>
                  </div>
                  <div className="absolute top-1 right-1 bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
                    <Heart size={10} className="text-mature-red" fill="currentColor" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <button onClick={() => navigate('/top')} className="block w-full text-left">
          <SectionHeader title="Top Ranked" subtitle="The System's highest-rated archives" />
        </button>
        <AnimeRow anime={top} />
      </section>

      <section>
        <SectionHeader title="Currently Airing" subtitle="Active broadcasts detected" />
        <AnimeRow anime={airing} />
      </section>

      <section>
        <SectionHeader title="This Season" subtitle="Seasonal releases available now" />
        <AnimeRow anime={seasonal} />
      </section>

      <section>
        <SectionHeader title="Upcoming" subtitle="Scheduled for deployment" />
        <AnimeRow anime={upcoming} />
      </section>
    </div>
  );
}

function HeroSection({ anime }: { anime: Anime }) {
  const image = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '';
  const title = anime.title_english || anime.title;

  return (
    <div className="relative h-[50vh] min-h-[400px] overflow-hidden border border-system-border sys-window">
      <div className="absolute inset-0">
        <img src={image} alt={title} className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-system-bg via-system-bg/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-system-bg via-transparent to-transparent" />
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.02) 3px, rgba(0,212,255,0.02) 6px)'
      }} />

      <div className="relative h-full flex flex-col justify-end p-6 md:p-12 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-system-glow rounded-full animate-glow-pulse" />
          <span className="font-system text-xs tracking-widest uppercase text-system-glow sys-text-glow">
            Featured Archive
          </span>
        </div>
        <h1 className="font-system text-3xl md:text-5xl font-bold text-white sys-text-glow-strong mb-3 leading-tight">
          {title}
        </h1>
        {anime.synopsis && (
          <p className="text-sm md:text-base text-system-text line-clamp-3 mb-4">
            {anime.synopsis}
          </p>
        )}
        <div className="flex items-center gap-4 mb-4">
          {anime.score && (
            <div className="flex items-center gap-1">
              <TrendingUp size={14} className="text-system-glow" />
              <span className="text-sm text-white font-mono">{anime.score.toFixed(2)}</span>
            </div>
          )}
          {anime.episodes && (
            <div className="flex items-center gap-1">
              <Radio size={14} className="text-system-glow" />
              <span className="text-sm text-system-text">{anime.episodes} Episodes</span>
            </div>
          )}
          {anime.year && (
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-system-glow" />
              <span className="text-sm text-system-text">{anime.year}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/anime/${anime.mal_id}`)}
            className="sys-button sys-button-active flex items-center gap-2"
          >
            <ChevronRight size={16} />
            Enter Archive
          </button>
        </div>
      </div>
    </div>
  );
}
