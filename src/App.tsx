import { useMemo } from 'react';
import { useHashRoute, parseRoute, navigate } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { NotificationStack } from '@/components/Notifications';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { DetailPage } from '@/pages/DetailPage';
import { WatchPage } from '@/pages/WatchPage';
import { GenrePage } from '@/pages/GenrePage';
import { SeasonPage } from '@/pages/SeasonPage';
import { TopPage } from '@/pages/TopPage';
import { MaturePage } from '@/pages/MaturePage';

function App() {
  const hash = useHashRoute();
  const route = useMemo(() => parseRoute(hash), [hash]);

  const renderPage = () => {
    const [section, param, sub] = route;

    switch (section) {
      case undefined:
        return <HomePage />;
      case 'search':
        return <SearchPage initialQuery={param ? decodeURIComponent(param) : ''} />;
      case 'anime':
        return <DetailPage id={parseInt(param, 10)} />;
      case 'watch':
        return <WatchPage id={parseInt(param, 10)} episode={sub ? parseInt(sub, 10) : 1} />;
      case 'genre':
        return <GenrePage genreId={parseInt(param, 10)} />;
      case 'season':
        return <SeasonPage />;
      case 'top':
        return <TopPage />;
      case 'airing':
        return <TopPage />;
      case 'mature':
        return <MaturePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-system-bg sys-grid">
      {/* Scanline overlay */}
      <div className="scanlines" />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-system-glow/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar currentPath={`/${route.join('/')}`} />

      <main className="relative max-w-[1600px] mx-auto px-4 py-6">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-system-border mt-12">
        <div className="max-w-[1600px] mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-system-glow rotate-45 flex items-center justify-center">
              <span className="font-system text-[10px] font-bold text-system-cyan -rotate-45">G</span>
            </div>
            <span className="font-system text-xs tracking-widest uppercase text-system-dim">
              GodChair System v1.0
            </span>
          </div>
          <p className="text-[10px] text-system-dim/60 font-mono">
            Data via Jikan API (MyAnimeList) — For demonstration purposes
          </p>
        </div>
      </footer>

      <NotificationStack />
    </div>
  );
}

export default App;
