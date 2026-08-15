import { useEffect, useState } from 'react';
import { getMatureAnime } from '@/lib/api';
import type { Anime } from '@/lib/types';
import { AnimeRow } from '@/components/AnimeRow';
import { LoadingState, SectionHeader, ErrorState } from '@/components/LoadingState';
import { verifyMatureAccess, isMatureVerified, clearMatureAccess, pushNotification } from '@/lib/store';
import { ShieldAlert, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export function MaturePage() {
  const [verified, setVerified] = useState(isMatureVerified());
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!verified) return;
    (async () => {
      setLoading(true);
      try {
        const r = await getMatureAnime();
        setAnime(r);
      } catch {
        setError(true);
      }
      setLoading(false);
    })();
  }, [verified]);

  const handleVerify = () => {
    if (verifyMatureAccess(passcode)) {
      setVerified(true);
      pushNotification({
        title: 'Access Granted',
        message: 'Restricted archive unlocked. Proceed with caution, Player.',
        type: 'danger',
      });
    } else {
      setAttempts((a) => a + 1);
      pushNotification({
        title: 'Access Denied',
        message: 'Incorrect passcode. The System rejects your request.',
        type: 'warning',
      });
      setPasscode('');
    }
  };

  const handleExit = () => {
    clearMatureAccess();
    setVerified(false);
    setAnime([]);
    pushNotification({
      title: 'Restricted Archive Closed',
      message: 'Mature access has been revoked.',
      type: 'info',
    });
  };

  if (!verified) {
    return <AgeGate
      passcode={passcode}
      setPasscode={setPasscode}
      showPasscode={showPasscode}
      setShowPasscode={setShowPasscode}
      attempts={attempts}
      onVerify={handleVerify}
    />;
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Warning banner */}
      <div className="sys-window border border-mature-border shadow-mature-glow p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert size={24} className="text-mature-red animate-glow-pulse" />
          <div>
            <p className="font-system text-sm tracking-widest uppercase text-mature-red mature-text-glow">
              Restricted Archive — 18+ Only
            </p>
            <p className="text-xs text-mature-dim mt-0.5">
              You are viewing mature-rated content. Access is session-based and will expire on browser close.
            </p>
          </div>
        </div>
        <button
          onClick={handleExit}
          className="px-3 py-1.5 text-xs font-system tracking-wider uppercase border border-mature-border text-mature-red hover:bg-mature-red/10 transition-all"
        >
          Exit Archive
        </button>
      </div>

      <div>
        <SectionHeader
          title="Mature Archives"
          subtitle="Rx-rated content — viewer discretion advised"
          variant="mature"
        />
        {loading ? (
          <LoadingState message="Accessing Restricted Data..." />
        ) : error ? (
          <ErrorState message="Restricted Archive Unavailable" />
        ) : (
          <AnimeRow anime={anime} variant="mature" />
        )}
      </div>
    </div>
  );
}

function AgeGate({
  passcode,
  setPasscode,
  showPasscode,
  setShowPasscode,
  attempts,
  onVerify,
}: {
  passcode: string;
  setPasscode: (v: string) => void;
  showPasscode: boolean;
  setShowPasscode: (v: boolean) => void;
  attempts: number;
  onVerify: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full">
        {/* Warning icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-mature-red/50 flex items-center justify-center animate-glow-pulse">
              <ShieldAlert size={36} className="text-mature-red" />
            </div>
            <div className="absolute -inset-2 border border-mature-red/20 animate-glow-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        <div className="sys-window border border-mature-border shadow-mature-glow p-6 text-center">
          <h1 className="font-system text-2xl font-bold text-mature-red mature-text-glow mb-2 tracking-wider">
            RESTRICTED ZONE
          </h1>
          <p className="text-sm text-mature-text mb-4">
            You are attempting to access mature content (18+).
            This archive contains anime rated Rx for adult audiences.
          </p>

          <div className="bg-mature-red/5 border border-mature-border/50 p-3 mb-6 text-left">
            <p className="text-xs text-mature-dim leading-relaxed">
              <AlertTriangle size={12} className="inline mr-1 text-mature-red" />
              By entering, you confirm you are 18 years or older and consent to viewing
              adult-rated content. Access is session-only and must be re-verified each session.
            </p>
          </div>

          {/* Passcode input */}
          <div className="space-y-3">
            <p className="font-system text-xs tracking-widest uppercase text-mature-dim">
              Enter System Passcode
            </p>
            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onVerify()}
                placeholder="•••••"
                className="w-full bg-mature-bg/50 border border-mature-border px-4 py-3 pr-10 text-white font-mono text-center tracking-widest focus:border-mature-red focus:outline-none focus:shadow-mature-glow transition-all"
                autoFocus
              />
              <button
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mature-dim hover:text-mature-red"
              >
                {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {attempts > 0 && (
              <p className="text-xs text-mature-red animate-flicker">
                Access denied. Attempts: {attempts}
              </p>
            )}

            <button
              onClick={onVerify}
              disabled={!passcode}
              className="w-full py-3 font-system text-sm tracking-widest uppercase border border-mature-red text-mature-red hover:bg-mature-red/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Lock size={14} className="inline mr-2" />
              Verify & Enter
            </button>

            <p className="text-[10px] text-mature-dim/50 pt-2">
              Hint: The passcode is a word from the System. "Arise."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
