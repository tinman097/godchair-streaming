import { useEffect, useState } from 'react';
import { getSeasonNow, getUpcoming } from '@/lib/api';
import type { Anime } from '@/lib/types';
import { AnimeRow } from '@/components/AnimeRow';
import { LoadingState, SectionHeader } from '@/components/LoadingState';

export function SeasonPage() {
  const [now, setNow] = useState<Anime[]>([]);
  const [upcoming, setUpcoming] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [n, u] = await Promise.all([getSeasonNow(), getUpcoming()]);
        setNow(n);
        setUpcoming(u);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState message="Scanning Seasonal Archives..." />;

  return (
    <div className="space-y-8 pb-12">
      <section>
        <SectionHeader title="Current Season" subtitle="Broadcasting now" />
        <AnimeRow anime={now} />
      </section>
      <section>
        <SectionHeader title="Upcoming Season" subtitle="Next wave of releases" />
        <AnimeRow anime={upcoming} />
      </section>
    </div>
  );
}
