import React from 'react';
import { Clapperboard, Plus } from 'lucide-react';
import { PLATFORM_ORDER } from '../data/initialState';
import {
  ActiveWorkspaceView,
  PlatformConnection,
  PlatformId,
  UserRole,
} from '../types/reelsync';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';

interface TopNavProps {
  activeView: ActiveWorkspaceView;
  onSelectView: (view: ActiveWorkspaceView) => void;
  platforms: Record<PlatformId, PlatformConnection>;
  onOpenAccountsModal: () => void;
  onNewReel: () => void;
  currentRole: UserRole;
  queueBadgeCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  platforms,
  onOpenAccountsModal,
  onNewReel,
  currentRole,
  queueBadgeCount,
}) => {
  const navItems: { id: ActiveWorkspaceView; label: string; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'composer', label: 'Studio' },
    { id: 'queue', label: 'Queue', count: queueBadgeCount },
    { id: 'admin', label: 'Admin Panel' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#09090B]/95 backdrop-blur-sm border-b border-zinc-800/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Title */}
        <button
          type="button"
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2.5 text-zinc-100 hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
        >
          <Clapperboard className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight">
            ReelSync
          </span>
        </button>

        {/* Zone 2: Single-line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:text-white ${
                  isActive
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="ml-1.5 text-xs font-mono tabular-nums text-zinc-500">
                    {item.count}
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Connection Status Strip + Primary New Reel Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenAccountsModal}
            title="Manage Connected Accounts & API Modes"
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex items-center gap-2">
              {PLATFORM_ORDER.map((pid) => {
                const conn = platforms[pid];
                const isReady = conn.connected;
                return (
                  <span
                    key={pid}
                    title={`${conn.name}: ${
                      isReady
                        ? conn.apiMode === 'live'
                          ? 'Live API'
                          : 'Sandbox Connected'
                        : 'Disconnected'
                    }`}
                    className={`flex items-center gap-1 text-xs ${
                      isReady ? getPlatformAccentText(pid) : 'text-zinc-600'
                    }`}
                  >
                    <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                    <span className="sr-only">{conn.shortName}</span>
                  </span>
                );
              })}
            </div>
            <span className="text-zinc-700" aria-hidden="true">
              |
            </span>
            <span className="text-xs font-medium text-zinc-300 capitalize">
              {currentRole}
            </span>
          </button>

          <button
            type="button"
            onClick={onNewReel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
