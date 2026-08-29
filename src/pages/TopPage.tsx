import { useEffect, useState } from 'react';
import { getTopAnime, getAiring } from '@/lib/api';
import type { Anime } from '@/lib/types';
import { AnimeRow } from '@/components/AnimeRow';
import { LoadingState, SectionHeader } from '@/components/LoadingState';

export function TopPage() {
  const [top, setTop] = useState<Anime[]>([]);
  const [airing, setAiring] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, a] = await Promise.all([getTopAnime(), getAiring()]);
        setTop(t);
        setAiring(a);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState message="Compiling Rankings..." />;

  return (
    <div className="space-y-8 pb-12">
      <section>
        <SectionHeader title="Top Anime" subtitle="The System's highest-rated archives" />
        <AnimeRow anime={top} />
      </section>
      <section>
        <SectionHeader title="Top Airing" subtitle="Currently broadcasting, ranked" />
        <AnimeRow anime={airing} />
      </section>
    </div>
  );
}
