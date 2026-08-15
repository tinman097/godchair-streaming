export function LoadingState({ message = 'Accessing the System...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-system-border rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-system-glow rounded-full animate-spin" />
        <div className="absolute inset-2 border-2 border-transparent border-b-system-cyan rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="font-system text-xs tracking-widest uppercase text-system-dim animate-flicker">
        {message}
      </p>
    </div>
  );
}

export function ErrorState({ message = 'System connection failed' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-16 h-16 border-2 border-mature-red/50 flex items-center justify-center">
        <span className="font-system text-2xl font-bold text-mature-red">!</span>
      </div>
      <p className="font-system text-sm tracking-wider uppercase text-mature-red">{message}</p>
      <p className="text-xs text-system-dim">The System is experiencing interference. Try again shortly.</p>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  variant = 'system',
}: {
  title: string;
  subtitle?: string;
  variant?: 'system' | 'mature';
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div
            className={`w-1 h-8 ${
              variant === 'mature' ? 'bg-mature-red' : 'bg-system-glow'
            } animate-glow-pulse`}
          />
          <h2
            className={`font-system text-2xl font-bold tracking-wider uppercase ${
              variant === 'mature' ? 'text-mature-red mature-text-glow' : 'text-white sys-text-glow'
            }`}
          >
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-sm text-system-dim ml-4">{subtitle}</p>}
      </div>
    </div>
  );
}
