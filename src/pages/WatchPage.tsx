import { useEffect, useState } from 'react';
import { getAnimeById, getAnimeEpisodes, addHistory } from '@/lib/api';
import type { Anime, Episode } from '@/lib/types';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { VideoPlayer } from '@/components/VideoPlayer';
import { navigate, pushNotification, getDeviceId } from '@/lib/store';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';

interface WatchPageProps {
  id: number;
  episode?: number;
}

export function WatchPage({ id, episode = 1 }: WatchPageProps) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const a = await getAnimeById(id);
        setAnime(a);
        setLoading(false);
        const eps = await getAnimeEpisodes(id);
        setEpisodes(eps);
        // Record to watch history
        addHistory(getDeviceId(), {
          mal_id: a.mal_id,
          title: a.title_english || a.title,
          image: a.images?.webp?.large_image_url || a.images?.jpg?.large_image_url || '',
        }, episode).catch(() => {});
      } catch {
        setError(true);
        setLoading(false);
      }
    })();
  }, [id, episode]);

  if (loading) return <LoadingState message="Preparing Playback..." />;
  if (error || !anime) return <ErrorState message="Playback Failed" />;

  const title = anime.title_english || anime.title;
  const poster = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || '';
  const currentEp = episodes[episode - 1];
  const epTitle = currentEp?.title || `Episode ${episode}`;
  const isMature = anime.rating === 'Rx' || anime.rating === 'R+';


  return (
    <div className="pb-12 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(`/anime/${id}`)}
        className="flex items-center gap-2 text-system-dim hover:text-system-cyan transition-colors mb-4 font-system text-xs tracking-wider uppercase"
      >
        <ChevronLeft size={14} />
        Archive Details
      </button>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Player */}
        <div className="space-y-4">
          <VideoPlayer
            src={''}
            poster={poster}
            title={title}
            episodeTitle={epTitle}
            variant={isMature ? 'mature' : 'system'}
            onEnded={() => {
              if (episode < (anime.episodes || episodes.length || 1)) {
                navigate(`/watch/${id}/${episode + 1}`);
              }
            }}
          />

          {/* Episode info */}
          <div className="sys-window border border-system-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-system text-xs tracking-widest uppercase text-system-glow mb-1">
                  Episode {episode}
                </p>
                <h2 className="text-lg font-bold text-white">{epTitle}</h2>
                <p className="text-sm text-system-dim mt-1">{title}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => episode > 1 && navigate(`/watch/${id}/${episode - 1}`)}
                  disabled={episode <= 1}
                  className="sys-button flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  onClick={() => {
                    if (episode < (anime.episodes || episodes.length || 1)) {
                      navigate(`/watch/${id}/${episode + 1}`);
                    }
                  }}
                  disabled={episode >= (anime.episodes || episodes.length || 1)}
                  className="sys-button flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Note about source */}
          <div className="sys-window border border-system-border p-3">
            <p className="text-xs text-system-dim leading-relaxed">
              <span className="text-system-glow font-system tracking-wider uppercase">System Notice: </span>
              The player is ready for HLS/MP4 streams. To enable full playback, connect a video source API
              through the System's edge function configuration.
            </p>
          </div>
        </div>

        {/* Episode list sidebar */}
        <div className="sys-window border border-system-border max-h-[70vh] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-system-border bg-black/30 flex items-center justify-between">
            <span className="font-system text-xs tracking-widest uppercase text-system-glow">
              Episode List
            </span>
            <List size={14} className="text-system-dim" />
          </div>
          <div className="overflow-y-auto flex-1">
            {episodes.length > 0 ? (
              episodes.map((ep, i) => (
                <button
                  key={ep.mal_id}
                  onClick={() => navigate(`/watch/${id}/${i + 1}`)}
                  className={`w-full text-left p-3 border-b border-system-border/50 transition-all ${
                    i + 1 === episode
                      ? 'bg-system-glow/10 border-l-2 border-l-system-glow'
                      : 'hover:bg-system-glow/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs ${
                        i + 1 === episode ? 'text-system-cyan' : 'text-system-dim'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs truncate ${
                          i + 1 === episode ? 'text-white' : 'text-system-text'
                        }`}
                      >
                        {ep.title || `Episode ${i + 1}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-system-dim">
                  No episode data available. You can still navigate using Prev/Next.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
