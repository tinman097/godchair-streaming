import { AnimeCard } from './AnimeCard';
import type { Anime } from '@/lib/types';

interface AnimeRowProps {
  anime: Anime[];
  variant?: 'system' | 'mature';
}

export function AnimeRow({ anime, variant = 'system' }: AnimeRowProps) {
  if (!anime || anime.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
      {anime.map((a, i) => (
        <AnimeCard key={a.mal_id} anime={a} index={i} variant={variant} />
      ))}
    </div>
  );
}
