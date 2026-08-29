import { useEffect, useState, useCallback } from 'react';
import { getAnimeById, getAnimeEpisodes, getRecommendations, getFavorites, addFavorite, removeFavorite } from '@/lib/api';
import type { Anime, Episode } from '@/lib/types';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { AnimeCard } from '@/components/AnimeCard';
import { navigate, pushNotification, getDeviceId } from '@/lib/store';
import { Star, Calendar, Clock, Tv, Users, Heart, Play, ChevronLeft, Bookmark } from 'lucide-react';

interface DetailPageProps {
  id: number;
}

export function DetailPage({ id }: DetailPageProps) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [recs, setRecs] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const checkFav = useCallback(async () => {
    try {
      const favs = await getFavorites(getDeviceId());
      setIsFav(favs.some((f) => f.mal_id === id));
    } catch {}
  }, [id]);

  useEffect(() => {
    checkFav();
  }, [checkFav]);

  const toggleFav = async () => {
    if (!anime || favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFavorite(getDeviceId(), anime.mal_id);
        setIsFav(false);
        pushNotification({ title: 'Removed', message: 'Anime removed from favorites.', type: 'info' });
      } else {
        await addFavorite(getDeviceId(), {
          mal_id: anime.mal_id,
          title: anime.title_english || anime.title,
          image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '',
        });
        setIsFav(true);
        pushNotification({ title: 'Favorited', message: 'Anime added to favorites.', type: 'success' });
      }
    } catch {
      pushNotification({ title: 'Error', message: 'Could not update favorites.', type: 'warning' });
    }
    setFavLoading(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const a = await getAnimeById(id);
        setAnime(a);
        setLoading(false);
        pushNotification({
          title: 'Archive Accessed',
          message: `${a.title_english || a.title} — data retrieved.`,
          type: 'info',
        });
        const [eps, r] = await Promise.all([
          getAnimeEpisodes(id),
          getRecommendations(id),
        ]);
        setEpisodes(eps);
        setRecs(r.map((x) => x.entry).slice(0, 8));
      } catch {
        setError(true);
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingState message="Retrieving Archive Data..." />;
  if (error || !anime) return <ErrorState message="Archive Not Found" />;

  const image = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '';
  const title = anime.title_english || anime.title;
  const isMature = anime.rating === 'Rx' || anime.rating === 'R+';

  return (
    <div className="pb-12 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => history.back()}
        className="flex items-center gap-2 text-system-dim hover:text-system-cyan transition-colors mb-4 font-system text-xs tracking-wider uppercase"
      >
        <ChevronLeft size={14} />
        Return
      </button>

      {/* Hero banner */}
      <div className="relative h-[30vh] min-h-[200px] overflow-hidden border border-system-border mb-6">
        <img src={image} alt={title} className="w-full h-full object-cover opacity-30 blur-sm scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-system-bg to-transparent" />
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Poster */}
        <div className="space-y-4">
          <div className="relative border border-system-border overflow-hidden">
            <img src={image} alt={title} className="w-full" />
            {anime.score && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 px-2 py-1 backdrop-blur-sm">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-mono text-white font-bold">{anime.score.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="sys-window border border-system-border p-4 space-y-3">
            <InfoRow icon={Tv} label="Type" value={anime.type || 'Unknown'} />
            <InfoRow icon={Calendar} label="Aired" value={anime.aired?.string || anime.year?.toString() || 'Unknown'} />
            <InfoRow icon={Clock} label="Duration" value={anime.duration || 'Unknown'} />
            <InfoRow icon={Tv} label="Status" value={anime.status || 'Unknown'} />
            <InfoRow icon={Users} label="Members" value={anime.members?.toLocaleString() || 'Unknown'} />
            <InfoRow icon={Heart} label="Favorites" value={anime.favorites?.toLocaleString() || 'Unknown'} />
            {anime.rating && (
              <InfoRow
                icon={Bookmark}
                label="Rating"
                value={anime.rating}
                highlight={isMature}
              />
            )}
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <button
                  key={g.mal_id}
                  onClick={() => navigate(`/genre/${g.mal_id}`)}
                  className="px-2 py-1 text-[10px] font-system tracking-wider uppercase border border-system-border text-system-dim hover:text-system-cyan hover:border-system-glow transition-all"
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <div>
            <h1 className="font-system text-2xl md:text-3xl font-bold text-white sys-text-glow mb-2">
              {title}
            </h1>
            {anime.title_japanese && (
              <p className="text-sm text-system-dim">{anime.title_japanese}</p>
            )}
          </div>

          {/* Synopsis */}
          {anime.synopsis && (
            <div className="sys-window border border-system-border p-4">
              <h3 className="font-system text-xs tracking-widest uppercase text-system-glow mb-2">
                Synopsis
              </h3>
              <p className="text-sm text-system-text leading-relaxed">{anime.synopsis}</p>
            </div>
          )}

          {/* Background */}
          {anime.background && (
            <div className="sys-window border border-system-border p-4">
              <h3 className="font-system text-xs tracking-widest uppercase text-system-glow mb-2">
                Background
              </h3>
              <p className="text-sm text-system-dim leading-relaxed">{anime.background}</p>
            </div>
          )}

          {/* Watch + Favorite buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/watch/${anime.mal_id}/1`)}
              className="sys-button sys-button-active flex items-center gap-2 text-base px-6 py-3"
            >
              <Play size={18} />
              Begin Watching
            </button>
            <button
              onClick={toggleFav}
              disabled={favLoading}
              className={`sys-button flex items-center gap-2 px-4 py-3 ${
                isFav ? 'sys-button-active' : ''
              }`}
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Favorited' : 'Favorite'}
            </button>
          </div>

          {/* Episodes */}
          {episodes.length > 0 && (
            <div>
              <h3 className="font-system text-sm tracking-widest uppercase text-system-glow mb-3">
                Episodes ({episodes.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-2">
                {episodes.map((ep, i) => (
                  <button
                    key={ep.mal_id}
                    onClick={() => navigate(`/watch/${anime.mal_id}/${i + 1}`)}
                    className="sys-window border border-system-border p-3 text-left hover:border-system-glow transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-system-border flex items-center justify-center font-mono text-xs text-system-cyan group-hover:border-system-glow transition-colors">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{ep.title || `Episode ${i + 1}`}</p>
                        {ep.aired && (
                          <p className="text-[10px] text-system-dim">{ep.aired.split('T')[0]}</p>
                        )}
                      </div>
                      {ep.filler && (
                        <span className="text-[9px] px-1 py-0.5 border border-mature-border text-mature-red">
                          FILLER
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recs.length > 0 && (
            <div>
              <h3 className="font-system text-sm tracking-widest uppercase text-system-glow mb-3">
                System Recommendations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recs.map((r, i) => (
                  <AnimeCard key={r.mal_id} anime={r} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-xs text-system-dim font-system tracking-wider uppercase">
        <Icon size={12} />
        {label}
      </span>
      <span
        className={`text-xs font-mono text-right ${
          highlight ? 'text-mature-red' : 'text-system-text'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
