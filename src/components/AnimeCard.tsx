import { Star, Play, Eye } from 'lucide-react';
import type { Anime } from '@/lib/types';
import { navigate } from '@/lib/store';

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: 'system' | 'mature';
}

export function AnimeCard({ anime, index = 0, variant = 'system' }: AnimeCardProps) {
  const accent = variant === 'mature' ? 'mature' : 'system';
  const image = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '';
  const title = anime.title_english || anime.title;

  return (
    <button
      onClick={() => navigate(`/anime/${anime.mal_id}`)}
      className="card-glow group relative text-left animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 30, 600)}ms`, animationFillMode: 'both' }}
    >
      <div
        className={`relative overflow-hidden border ${
          variant === 'mature' ? 'border-mature-border' : 'border-system-border'
        } bg-system-dark aspect-[2/3]`}
      >
        {/* Image */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-system-bg via-transparent to-transparent" />

        {/* Rank number if provided */}
        {index >= 0 && (
          <div
            className={`absolute top-0 left-0 px-2 py-1 font-system text-xs font-bold ${
              variant === 'mature'
                ? 'bg-mature-red/80 text-white'
                : 'bg-system-glow/80 text-system-bg'
            }`}
          >
            #{index + 1}
          </div>
        )}

        {/* Score badge */}
        {anime.score && (
          <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-mono text-white">{anime.score.toFixed(1)}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              variant === 'mature' ? 'border-mature-red' : 'border-system-glow'
            } ${variant === 'mature' ? 'shadow-mature-glow' : 'shadow-system-glow'}`}
          >
            <Play size={20} className={variant === 'mature' ? 'text-mature-red' : 'text-system-cyan'} fill="currentColor" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-xs font-mono text-white font-bold truncate">{title}</p>
          <div className="flex items-center gap-2 mt-1">
            {anime.type && (
              <span className="text-[10px] text-system-dim uppercase">{anime.type}</span>
            )}
            {anime.episodes && (
              <span className="flex items-center gap-0.5 text-[10px] text-system-dim">
                <Eye size={8} />
                {anime.episodes} eps
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
