import { useEffect, useState } from 'react';
import { getAnimeByGenre, GENRES } from '@/lib/api';
import type { Anime } from '@/lib/types';
import { AnimeRow } from '@/components/AnimeRow';
import { LoadingState, SectionHeader } from '@/components/LoadingState';

interface GenrePageProps {
  genreId: number;
}

export function GenrePage({ genreId }: GenrePageProps) {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const genre = GENRES.find((g) => g.id === genreId);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await getAnimeByGenre(genreId);
        setAnime(r);
      } catch {
        setAnime([]);
      }
      setLoading(false);
    })();
  }, [genreId]);

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader title={genre?.name || 'Genre'} subtitle="Filtered archive results" />
      {loading ? <LoadingState /> : <AnimeRow anime={anime} />}
    </div>
  );
}
