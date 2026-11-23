import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Film,
  Loader2,
  Pencil,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { PLATFORM_ORDER, ROLE_PERMISSIONS } from '../data/initialState';
import {
  PlatformConnection,
  PlatformId,
  PublishJobStatus,
  QueueFilterTab,
  ReelItem,
  UserRole,
} from '../types/reelsync';
import { formatBytes, formatDuration } from '../utils/videoInspector';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';

interface PublishingQueueProps {
  reels: ReelItem[];
  platforms: Record<PlatformId, PlatformConnection>;
  isOwnerAdmin: boolean;
  currentRole: UserRole;
  onRetryPlatform: (reelId: string, platformId: PlatformId) => void;
  onDeleteReel: (reelId: string) => void;
  onEditReel: (reel: ReelItem) => void;
  onPreviewReel: (reel: ReelItem) => void;
  onOpenAccountsModal: () => void;
  onNewReel: () => void;
}

function getReelCategoryFlags(reel: ReelItem) {
  const states = Object.values(reel.platforms).filter((s) => s.enabled);
  const hasAttention = states.some(
    (s) => s.status === 'failed' || s.status === 'needs_api_setup'
  );
  const isScheduled =
    reel.publishMode === 'schedule' ||
    states.some((s) => s.status === 'queued' || s.status === 'uploading');
  const isPublished =
    states.length > 0 && states.every((s) => s.status === 'published');

  return { hasAttention, isScheduled, isPublished };
}

function renderStatusLabel(status: PublishJobStatus, progressPct: number) {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Published</span>
        </span>
      );
    case 'uploading':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 font-mono tabular-nums">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>Uploading {progressPct}%</span>
        </span>
      );
    case 'queued':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-800 dark:text-blue-200">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Queued</span>
        </span>
      );
    case 'needs_api_setup':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Needs API Setup</span>
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Failed</span>
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-blue-700/70 dark:text-blue-400/70">
          <span>Draft</span>
        </span>
      );
  }
}

export const PublishingQueue: React.FC<PublishingQueueProps> = ({
  reels,
  platforms,
  isOwnerAdmin,
  currentRole,
  onRetryPlatform,
  onDeleteReel,
  onEditReel,
  onPreviewReel,
  onOpenAccountsModal,
  onNewReel,
}) => {
  const [activeTab, setActiveTab] = useState<QueueFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const permissions = ROLE_PERMISSIONS[currentRole];

  const counts = useMemo(() => {
    let scheduled = 0;
    let published = 0;
    let needsAttention = 0;

    reels.forEach((r) => {
      const flags = getReelCategoryFlags(r);
      if (flags.hasAttention) needsAttention += 1;
      if (flags.isScheduled) scheduled += 1;
      if (flags.isPublished) published += 1;
    });

    return {
      all: reels.length,
      scheduled,
      published,
      needs_attention: needsAttention,
    };
  }, [reels]);

  const filteredReels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reels.filter((reel) => {
      const flags = getReelCategoryFlags(reel);
      if (activeTab === 'scheduled' && !flags.isScheduled) return false;
      if (activeTab === 'published' && !flags.isPublished) return false;
      if (activeTab === 'needs_attention' && !flags.hasAttention) return false;

      if (!q) return true;
      return (
        reel.title.toLowerCase().includes(q) ||
        reel.sharedCaption.toLowerCase().includes(q) ||
        reel.authorName.toLowerCase().includes(q)
      );
    });
  }, [reels, activeTab, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };

  const tabs: { id: QueueFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Reels', count: counts.all },
    { id: 'scheduled', label: 'Scheduled', count: counts.scheduled },
    { id: 'published', label: 'Published', count: counts.published },
    { id: 'needs_attention', label: 'Needs Attention', count: counts.needs_attention },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-200/80 dark:border-blue-900/70">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-50 text-balance">
            Publishing Queue & Status
          </h1>
          <p className="text-sm text-blue-800/80 dark:text-blue-200/75 mt-0.5">
            Track live upload progression, scheduled drops, and per-platform API readiness.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-700 text-blue-900 dark:text-blue-100 transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Status</span>
          </button>
          {isOwnerAdmin && (
            <button
              type="button"
              onClick={onOpenAccountsModal}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-700 text-blue-950 dark:text-blue-100 transition-colors whitespace-nowrap"
            >
              API Settings
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-xl overflow-x-auto">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'text-white dark:text-slate-950'
                    : 'text-blue-800/80 hover:text-blue-950 dark:text-blue-200/75 dark:hover:text-blue-50'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="queue-tab-active"
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 rounded-lg bg-blue-600 dark:bg-blue-500 shadow-xs"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 font-mono tabular-nums ${
                    active
                      ? 'text-blue-100 dark:text-slate-950/80'
                      : 'text-blue-700/70 dark:text-blue-400/70'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-blue-700/60 dark:text-blue-400/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, caption, author..."
            className="w-full bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Queue Content */}
      {isRefreshing ? (
        <div className="space-y-3" aria-label="Loading queue">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-14 h-24 rounded-lg studio-shimmer shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-56 studio-shimmer rounded" />
                <div className="h-3 w-96 max-w-full studio-shimmer rounded" />
                <div className="h-3 w-48 studio-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredReels.length === 0 ? (
        <div className="bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="mx-auto w-11 h-11 rounded-xl bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 flex items-center justify-center">
            <Film className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <h2 className="font-display text-base font-medium text-blue-950 dark:text-blue-50">
            No reels match this filter
          </h2>
          <p className="text-xs text-blue-800/80 dark:text-blue-200/75 max-w-sm mx-auto">
            {searchQuery
              ? 'Try clearing your search query or switching to All Reels.'
              : 'Upload a short-form video in the Studio to publish or schedule across your channels.'}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onNewReel}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white dark:from-blue-500 dark:to-sky-400 dark:text-slate-950 transition-all"
            >
              Compose New Reel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl divide-y divide-blue-200/80 dark:divide-blue-900/70 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] overflow-hidden">
          {filteredReels.map((reel) => {
            const enabledPlatforms = PLATFORM_ORDER.filter(
              (pid) => reel.platforms[pid]?.enabled
            );

            return (
              <article
                key={reel.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-start gap-5 hover:bg-blue-50/55 dark:hover:bg-blue-950/30 transition-colors"
              >
                {/* Left: Thumbnail & Core Metadata */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onPreviewReel(reel)}
                    aria-label={`Preview ${reel.title}`}
                    className="group relative w-16 aspect-[9/16] rounded-xl overflow-hidden bg-black border border-blue-200 dark:border-blue-900/70 shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {reel.thumbnailUrl ? (
                      <img
                        src={reel.thumbnailUrl}
                        alt={reel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-950 to-black">
                        <Film className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </button>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onPreviewReel(reel)}
                        className="text-left font-display text-sm font-semibold text-blue-950 hover:text-blue-600 dark:text-blue-50 dark:hover:text-blue-300 transition-colors truncate"
                      >
                        {reel.title}
                      </button>
                    </div>

                    <p className="text-xs text-blue-800/80 dark:text-blue-200/75 line-clamp-2 leading-relaxed">
                      {reel.sharedCaption || 'No shared caption added.'}
                    </p>

                    {/* Unboxed Metadata with typographic separators */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-blue-700/75 dark:text-blue-400/70 pt-1">
                      <span className="font-mono tabular-nums text-blue-900 dark:text-blue-200">
                        {formatDuration(reel.metadata.durationSec)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {reel.metadata.width}×{reel.metadata.height}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatBytes(reel.metadata.fileSizeBytes)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        By {reel.authorName} ({reel.authorRole})
                      </span>
                      {reel.publishMode === 'schedule' && reel.scheduledFor && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-mono tabular-nums">
                            <Calendar className="w-3 h-3" />
                            Scheduled {reel.scheduledFor.replace('T', ' ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Per-Platform Status Hairline List */}
                <div className="lg:w-[430px] shrink-0 divide-y divide-blue-200/75 dark:divide-blue-900/70 rounded-xl bg-[#F2F7FF]/85 dark:bg-[#051024]/90 px-3.5 py-1">
                  {enabledPlatforms.length === 0 ? (
                    <div className="text-xs text-blue-700/75 dark:text-blue-400/70 py-2">
                      Saved as draft with no active platform targets.
                    </div>
                  ) : (
                    enabledPlatforms.map((pid) => {
                      const state = reel.platforms[pid];
                      const conn = platforms[pid];
                      const canRetry =
                        (state.status === 'failed' ||
                          state.status === 'needs_api_setup') &&
                        permissions.canRetryOrDelete;

                      return (
                        <div key={pid} className="py-2 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={getPlatformAccentText(pid)}>
                                <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-xs font-medium text-blue-950 dark:text-blue-100 truncate">
                                {conn.shortName}
                              </span>
                              {state.channelUrlUsed && (
                                <a
                                  href={state.publishedUrl || state.channelUrlUsed}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={state.publishedUrl || state.channelUrlUsed}
                                  className="text-blue-700/70 hover:text-blue-950 dark:text-blue-400/70 dark:hover:text-blue-100 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              {renderStatusLabel(state.status, state.progressPct)}

                              {canRetry && (
                                <button
                                  type="button"
                                  onClick={() => onRetryPlatform(reel.id, pid)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100 transition-colors whitespace-nowrap"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Retry</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {state.status === 'uploading' && (
                            <div className="w-full h-1 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-200"
                                style={{ width: `${state.progressPct}%` }}
                              />
                            </div>
                          )}

                          {state.errorMessage &&
                            (state.status === 'needs_api_setup' ||
                              state.status === 'failed') && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-300/85 leading-snug">
                                {state.errorMessage}
                              </p>
                            )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right: Row Actions */}
                <div className="flex lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0">
                  {permissions.canUploadAndCompose && (
                    <button
                      type="button"
                      onClick={() => onEditReel(reel)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-900 hover:text-blue-950 bg-[#F2F7FF] dark:bg-[#051024] dark:text-blue-100 dark:hover:text-white border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 dark:hover:border-blue-600 transition-colors whitespace-nowrap"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}

                  {permissions.canRetryOrDelete && (
                    <button
                      type="button"
                      onClick={() => onDeleteReel(reel.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 hover:text-red-600 bg-[#F2F7FF] dark:bg-[#051024] dark:text-blue-300/80 dark:hover:text-red-400 border border-blue-200 dark:border-blue-800/80 hover:border-red-300 dark:hover:border-red-800/70 transition-colors whitespace-nowrap"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
