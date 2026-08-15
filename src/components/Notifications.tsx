import { CheckCircle, AlertTriangle, ShieldAlert, Info, X } from 'lucide-react';
import { useNotifications } from '@/lib/store';
import type { SystemNotification } from '@/lib/store';

const iconFor = (type: SystemNotification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={18} className="text-green-400" />;
    case 'warning':
      return <AlertTriangle size={18} className="text-yellow-400" />;
    case 'danger':
      return <ShieldAlert size={18} className="text-mature-red" />;
    default:
      return <Info size={18} className="text-system-cyan" />;
  }
};

const borderFor = (type: SystemNotification['type']) => {
  switch (type) {
    case 'success':
      return 'border-green-500/50';
    case 'warning':
      return 'border-yellow-500/50';
    case 'danger':
      return 'border-mature-red/50';
    default:
      return 'border-system-glow/50';
  }
};

export function NotificationStack() {
  const items = useNotifications();

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 items-center w-full max-w-md px-4 pointer-events-none">
      {items.map((n) => (
        <div
          key={n.id}
          className={`sys-window notif-pop pointer-events-auto w-full ${borderFor(n.type)} border px-4 py-3 flex items-start gap-3`}
        >
          {iconFor(n.type)}
          <div className="flex-1 min-w-0">
            <p className="font-system text-xs tracking-wider uppercase text-white font-bold">
              {n.title}
            </p>
            <p className="text-sm text-system-text mt-0.5">{n.message}</p>
          </div>
          <button
            className="text-system-dim hover:text-white transition-colors"
            onClick={() => {}}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
