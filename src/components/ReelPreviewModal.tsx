import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Film, X } from 'lucide-react';
import { PLATFORM_ORDER } from '../data/initialState';
import { PlatformConnection, PlatformId, ReelItem } from '../types/reelsync';
import { formatBytes, formatDuration } from '../utils/videoInspector';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';

interface ReelPreviewModalProps {
  reel: ReelItem | null;
  platforms: Record<PlatformId, PlatformConnection>;
  onClose: () => void;
}

export const ReelPreviewModal: React.FC<ReelPreviewModalProps> = ({
  reel,
  platforms,
  onClose,
}) => {
  const activeTargets = reel
    ? PLATFORM_ORDER.filter((pid) => reel.platforms[pid]?.enabled)
    : [];

  return (
    <AnimatePresence>
      {reel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/45 dark:bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reel-preview-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl bg-white dark:bg-[#07132A] border border-blue-200 dark:border-blue-800/80 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-3.5 border-b border-blue-200 dark:border-blue-900/80 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="reel-preview-title"
                  className="font-display text-sm font-semibold text-blue-950 dark:text-blue-50 truncate"
                >
                  {reel.title}
                </h2>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/75 font-mono tabular-nums mt-0.5">
                  {formatDuration(reel.metadata.durationSec)} · {reel.metadata.width}×
                  {reel.metadata.height} · {formatBytes(reel.metadata.fileSizeBytes)}
                </p>
              </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="p-1.5 rounded-lg text-blue-700 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-300/80 dark:hover:text-blue-50 dark:hover:bg-blue-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Vertical Frame */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-[240px] aspect-[9/16] rounded-xl overflow-hidden bg-black border border-blue-200 dark:border-blue-900/80">
              {reel.videoObjectUrl ? (
                <video
                  src={reel.videoObjectUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : reel.thumbnailUrl ? (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-blue-300/70">
                  <Film className="w-8 h-8 mb-2" />
                  <span className="text-xs">{reel.metadata.fileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Caption & Platform Breakdown */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <h3 className="text-xs font-medium text-blue-800/80 dark:text-blue-300/75 mb-1.5">
                Shared Caption
              </h3>
              <p className="text-sm text-blue-950 dark:text-blue-100 bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 rounded-lg p-3 leading-relaxed">
                {reel.sharedCaption || 'No caption set.'}
              </p>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-medium text-blue-800/80 dark:text-blue-300/75">
                Channel Destinations ({activeTargets.length})
              </h3>
              {activeTargets.map((pid) => {
                const state = reel.platforms[pid];
                const conn = platforms[pid];
                return (
                  <div
                    key={pid}
                    className="p-3 rounded-lg bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={getPlatformAccentText(pid)}>
                          <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-semibold text-blue-950 dark:text-blue-50">
                          {conn.name}
                        </span>
                      </div>
                      <span className="text-xs text-blue-700/80 dark:text-blue-300/75 capitalize">
                        {state.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {state.platformTitle && (
                      <p className="text-xs text-blue-900/85 dark:text-blue-200/85">
                        Title: {state.platformTitle}
                      </p>
                    )}
                    <a
                      href={state.publishedUrl || state.channelUrlUsed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                    >
                      <span>{state.publishedUrl || state.channelUrlUsed}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
