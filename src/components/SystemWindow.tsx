import { type ReactNode } from 'react';

interface SystemWindowProps {
  children: ReactNode;
  title?: string;
  className?: string;
  variant?: 'system' | 'mature';
  glow?: boolean;
}

export function SystemWindow({
  children,
  title,
  className = '',
  variant = 'system',
  glow = false,
}: SystemWindowProps) {
  const borderColor = variant === 'mature' ? 'border-mature-border' : 'border-system-border';
  const textColor = variant === 'mature' ? 'text-mature-text' : 'text-system-text';
  const glowClass =
    glow === true
      ? variant === 'mature'
        ? 'shadow-mature-glow'
        : 'shadow-system-glow'
      : '';

  return (
    <div
      className={`sys-window sys-corner relative ${borderColor} border ${glowClass} ${className}`}
    >
      {title && (
        <div
          className={`flex items-center gap-2 px-4 py-2 border-b ${borderColor} bg-black/30`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-glow-pulse ${
              variant === 'mature' ? 'bg-mature-glow' : 'bg-system-glow'
            }`}
          />
          <span
            className={`font-system text-xs tracking-widest uppercase ${
              variant === 'mature' ? 'text-mature-glow mature-text-glow' : 'text-system-glow sys-text-glow'
            }`}
          >
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
