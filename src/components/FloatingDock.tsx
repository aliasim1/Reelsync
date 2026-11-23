import React from 'react';
import {
  Clapperboard,
  LayoutGrid,
  ListVideo,
  PlugZap,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { ActiveWorkspaceView } from '../types/reelsync';

interface FloatingDockProps {
  activeView: ActiveWorkspaceView;
  onSelectView: (view: ActiveWorkspaceView) => void;
  onOpenAccountsModal: () => void;
  onNewReel: () => void;
  queueBadgeCount: number;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeView,
  onSelectView,
  onOpenAccountsModal,
  onNewReel,
  queueBadgeCount,
}) => {
  const dockButtons: {
    id: ActiveWorkspaceView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: 'composer',
      label: 'Studio',
      icon: <Clapperboard className="w-4 h-4" />,
    },
    {
      id: 'queue',
      label: 'Queue',
      icon: <ListVideo className="w-4 h-4" />,
      badge: queueBadgeCount,
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <SlidersHorizontal className="w-4 h-4" />,
    },
  ];

  return (
    <div className="hidden md:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <nav
        aria-label="Floating Studio Dock"
        className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-2 rounded-2xl bg-zinc-900/85 backdrop-blur-xl border border-zinc-700/70 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)]"
      >
        {dockButtons.map((btn) => {
          const isActive = activeView === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => onSelectView(btn.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
              {typeof btn.badge === 'number' && btn.badge > 0 && (
                <span className="font-mono tabular-nums text-[11px] text-blue-400">
                  {btn.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="w-px h-5 bg-zinc-800 mx-1" aria-hidden="true" />

        <button
          type="button"
          onClick={onOpenAccountsModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <PlugZap className="w-4 h-4" />
          <span>Accounts</span>
        </button>

        <button
          type="button"
          onClick={onNewReel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Reel</span>
        </button>
      </nav>
    </div>
  );
};
