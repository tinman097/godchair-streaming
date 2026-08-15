import { useEffect, useState, useCallback } from 'react';
import { searchAnime, GENRES } from '@/lib/api';
import type { Anime } from '@/lib/types';
import { AnimeRow } from '@/components/AnimeRow';
import { LoadingState, SectionHeader } from '@/components/LoadingState';
import { Search as SearchIcon, X } from 'lucide-react';
import { navigate } from '@/lib/store';

interface SearchPageProps {
  initialQuery?: string;
}

export function SearchPage({ initialQuery = '' }: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const r = await searchAnime(q);
      setResults(r);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      doSearch(initialQuery);
    }
  }, [initialQuery, doSearch]);

  return (
    <div className="space-y-6 pb-12">
      <SectionHeader title="Search Archives" subtitle="Query the System's database" />

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
          placeholder="Enter anime title..."
          className="w-full bg-system-dark border border-system-border px-12 py-3 text-white font-mono text-sm focus:border-system-glow focus:outline-none focus:shadow-system-glow transition-all"
        />
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-system-dim" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setSearched(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-system-dim hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Genre quick filters */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => navigate(`/genre/${g.id}`)}
            className="px-3 py-1.5 text-xs font-system tracking-wider uppercase border border-system-border text-system-dim hover:text-system-cyan hover:border-system-glow transition-all"
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && <LoadingState message="Querying the System..." />}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-20">
          <p className="font-system text-sm tracking-wider uppercase text-system-dim">
            No results found in the System
          </p>
        </div>
      )}

      {!loading && results.length > 0 && <AnimeRow anime={results} />}

      {!loading && !searched && (
        <div className="text-center py-20">
          <SearchIcon size={48} className="text-system-border mx-auto mb-4" />
          <p className="font-system text-sm tracking-wider uppercase text-system-dim">
            Begin your search to access the System's archives
          </p>
        </div>
      )}
    </div>
  );
}
