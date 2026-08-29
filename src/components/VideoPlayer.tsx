import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  episodeTitle?: string;
  onEnded?: () => void;
  variant?: 'system' | 'mature';
}

export function VideoPlayer({
  src,
  poster,
  title,
  episodeTitle,
  onEnded,
  variant = 'system',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [buffered, setBuffered] = useState(0);
  const hideTimer = useRef<number | undefined>(undefined);

  const accent = variant === 'mature' ? 'mature' : 'system';
  const accentColor = variant === 'mature' ? '#ff2a4a' : '#00d4ff';

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const skip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    setLoading(true);
    v.load();
  }, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onCanPlay = () => setLoading(false);
    const onTime = () => {
      if (v.duration) {
        setProgress((v.currentTime / v.duration) * 100);
        setCurrent(v.currentTime);
        if (v.buffered.length > 0) {
          setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
        }
      }
    };
    const onMeta = () => setDuration(v.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      onEnded?.();
    };
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('ended', onEnd);
    return () => {
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('ended', onEnd);
    };
  }, [onEnded]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed]);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!src) {
    return (
      <div className="aspect-video bg-system-dark border border-system-border flex items-center justify-center">
        <div className="text-center px-6">
          <Settings size={32} className="text-system-dim mx-auto mb-3" />
          <p className="font-system text-sm text-system-dim tracking-wider uppercase">
            No Stream Source Available
          </p>
          <p className="text-xs text-system-dim/60 mt-2">
            Connect a video source to this episode to begin playback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black border border-system-border overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <Loader2 size={40} className="animate-spin" style={{ color: accentColor }} />
        </div>
      )}

      {/* Title overlay (top) */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300">
          {title && (
            <p className="font-system text-sm tracking-wider uppercase text-white truncate">
              {title}
            </p>
          )}
          {episodeTitle && (
            <p className="text-xs text-system-dim mt-0.5 truncate">{episodeTitle}</p>
          )}
        </div>
      )}

      {/* Center play button */}
      {!playing && !loading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110"
            style={{
              borderColor: accentColor,
              boxShadow: `0 0 30px ${accentColor}66`,
            }}
          >
            <Play size={32} style={{ color: accentColor }} fill="currentColor" />
          </div>
        </button>
      )}

      {/* Controls (bottom) */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div
          className="relative h-1 bg-system-border/50 cursor-pointer group/bar"
          onClick={seek}
        >
          <div
            className="absolute h-full bg-system-border/30"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute h-full transition-all"
            style={{
              width: `${progress}%`,
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{
              left: `${progress}%`,
              background: accentColor,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-t from-black/90 to-transparent">
          <button onClick={togglePlay} className="text-white hover:text-system-cyan transition-colors">
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={() => skip(-10)} className="text-system-text hover:text-white transition-colors">
            <SkipBack size={18} />
          </button>
          <button onClick={() => skip(10)} className="text-system-text hover:text-white transition-colors">
            <SkipForward size={18} />
          </button>
          <button onClick={toggleMute} className="text-system-text hover:text-white transition-colors">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <span className="text-xs font-mono text-system-dim ml-1">
            {fmt(current)} / {fmt(duration)}
          </span>

          <div className="flex-1" />

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-system-text hover:text-white transition-colors"
            >
              <Settings size={18} />
            </button>
            {showSettings && (
              <div className="absolute bottom-10 right-0 sys-window border border-system-border p-3 min-w-[160px] animate-fade-in">
                <p className="font-system text-[10px] tracking-widest uppercase text-system-dim mb-2">Playback Speed</p>
                <div className="flex gap-1 mb-3">
                  {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-1 text-xs font-mono border ${
                        speed === s
                          ? 'border-system-glow text-system-cyan bg-system-glow/10'
                          : 'border-system-border text-system-dim'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <p className="font-system text-[10px] tracking-widest uppercase text-system-dim mb-2">Quality</p>
                <div className="flex gap-1">
                  {['Auto', '720p', '1080p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`px-2 py-1 text-xs font-mono border ${
                        quality === q
                          ? 'border-system-glow text-system-cyan bg-system-glow/10'
                          : 'border-system-border text-system-dim'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={toggleFullscreen} className="text-system-text hover:text-white transition-colors">
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
