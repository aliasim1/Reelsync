import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  KeyRound,
  Lock,
  PlugZap,
  ShieldAlert,
  X,
} from 'lucide-react';
import { PLATFORM_ORDER, ROLE_PERMISSIONS } from '../data/initialState';
import {
  ApiMode,
  PlatformConnection,
  PlatformId,
  UserRole,
} from '../types/reelsync';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';

interface ConnectedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Record<PlatformId, PlatformConnection>;
  isOwnerAdmin: boolean;
  currentRole: UserRole;
  onUpdatePlatform: (
    platformId: PlatformId,
    patch: Partial<PlatformConnection>
  ) => void;
  onNotify: (
    variant: 'success' | 'info' | 'warning' | 'error',
    title: string,
    description?: string
  ) => void;
}

export const ConnectedAccountsModal: React.FC<ConnectedAccountsModalProps> = ({
  isOpen,
  onClose,
  platforms,
  isOwnerAdmin,
  currentRole,
  onUpdatePlatform,
  onNotify,
}) => {
  const [expandedGuide, setExpandedGuide] = useState<PlatformId | null>('snapchat');

  const canManage = isOwnerAdmin && ROLE_PERMISSIONS[currentRole].canManageAccounts;

  const handleToggleConnect = (pid: PlatformId) => {
    if (!canManage) {
      onNotify(
        'warning',
        'Admin permission required',
        'Only the workspace Admin can modify connected channels or API settings.'
      );
      return;
    }

    const curr = platforms[pid];
    if (curr.connected) {
      onUpdatePlatform(pid, {
        connected: false,
        apiMode: 'unconfigured',
      });
      onNotify('info', `${curr.name} disconnected`, 'Queued jobs for this platform will pause.');
    } else {
      const nextMode: ApiMode =
        curr.clientId.trim() && curr.webhookEndpoint.trim() ? 'live' : 'sandbox';
      onUpdatePlatform(pid, {
        connected: true,
        apiMode: nextMode,
        lastSyncedAt: new Date().toISOString(),
      });
      onNotify(
        'success',
        `${curr.name} connected (${nextMode === 'live' ? 'Live API' : 'Sandbox Mode'})`,
        'You can now publish or retry queued reels.'
      );
    }
  };

  const handleModeChange = (pid: PlatformId, mode: ApiMode) => {
    if (!canManage) return;
    const curr = platforms[pid];
    if (mode === 'live' && (!curr.clientId.trim() || !curr.webhookEndpoint.trim())) {
      onNotify(
        'warning',
        'Live credentials missing',
        `Enter Client ID and Webhook URL for ${curr.name}, or stay in Sandbox Mode to test safely.`
      );
      return;
    }
    onUpdatePlatform(pid, {
      apiMode: mode,
      connected: mode !== 'unconfigured',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex justify-end bg-blue-950/40 dark:bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accounts-drawer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-white dark:bg-[#07132A] border-l border-blue-200 dark:border-blue-900/80 h-full flex flex-col overflow-hidden shadow-2xl"
          >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-blue-200 dark:border-blue-900/80 flex items-center justify-between gap-4">
          <div>
            <h2
              id="accounts-drawer-title"
              className="font-display text-base font-semibold text-blue-950 dark:text-blue-50"
            >
              {isOwnerAdmin ? 'Connected Accounts & API Modes' : 'Connected Social Channels'}
            </h2>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/75 mt-0.5">
              {isOwnerAdmin
                ? 'Connect social channels or test the full publishing queue in Sandbox Mode.'
                : 'View active social publishing channels configured for this workspace.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-blue-700 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-300/80 dark:hover:text-blue-50 dark:hover:bg-blue-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!isOwnerAdmin ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 text-xs text-blue-900 dark:text-blue-200">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                Channel connections and API keys are managed by the workspace Admin. You can compose and publish reels across any active channel below.
              </span>
            </div>
          ) : !canManage ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 text-xs text-blue-900 dark:text-blue-200">
              <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                You are previewing as <strong className="capitalize">{currentRole}</strong>. Switch back to Admin role to modify OAuth or Sandbox settings.
              </span>
            </div>
          ) : null}

          {PLATFORM_ORDER.map((pid) => {
            const conn = platforms[pid];
            const isGuideOpen = expandedGuide === pid;

            return (
              <div
                key={pid}
                className="bg-[#F2F7FF] dark:bg-[#0A1A38]/80 border border-blue-200 dark:border-blue-900/70 rounded-xl p-4 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 flex items-center justify-center shrink-0">
                      <span className={getPlatformAccentText(pid)}>
                        <PlatformIcon platformId={pid} className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-50">
                          {conn.name}
                        </h3>
                        <span className="text-xs text-blue-500/70" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-blue-800/80 dark:text-blue-200/75 font-mono">
                          {conn.handle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        {conn.connected ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {conn.apiMode === 'live'
                                ? 'Live Channel Active'
                                : 'Active (Ready to Publish)'}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <PlugZap className="w-3.5 h-3.5" />
                            <span>Inactive · Admin Setup Needed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isOwnerAdmin && (
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => handleToggleConnect(pid)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 ${
                        conn.connected
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100'
                          : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 font-semibold'
                      }`}
                    >
                      {conn.connected ? 'Disconnect' : 'Connect Sandbox'}
                    </button>
                  )}
                </div>

                {/* Channel URL Reference */}
                <div className="flex items-center justify-between gap-2 text-xs bg-white dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 rounded-lg px-3 py-2">
                  <span className="text-blue-700/75 dark:text-blue-400/70 shrink-0">
                    Channel URL:
                  </span>
                  <a
                    href={conn.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-blue-900 hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-400 truncate"
                  >
                    <span className="truncate">{conn.channelUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Admin-Only API Mode, Credentials & Setup Instructions */}
                {isOwnerAdmin && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-blue-800/80 dark:text-blue-300/75 mb-1">
                          Publishing Mode
                        </label>
                        <select
                          disabled={!canManage}
                          value={conn.apiMode}
                          onChange={(e) =>
                            handleModeChange(pid, e.target.value as ApiMode)
                          }
                          className="w-full bg-white dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                        >
                          <option value="sandbox">Sandbox Simulation (No Keys Needed)</option>
                          <option value="live">Live OAuth / Webhook</option>
                          <option value="unconfigured">Disconnected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-blue-800/80 dark:text-blue-300/75 mb-1">
                          OAuth Client ID (Optional)
                        </label>
                        <input
                          type="text"
                          disabled={!canManage}
                          value={conn.clientId}
                          onChange={(e) =>
                            onUpdatePlatform(pid, { clientId: e.target.value })
                          }
                          placeholder="Configure for live OAuth..."
                          className="w-full bg-white dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-blue-800/80 dark:text-blue-300/75 mb-1">
                        Backend Publishing Webhook Endpoint (Optional)
                      </label>
                      <input
                        type="url"
                        disabled={!canManage}
                        value={conn.webhookEndpoint}
                        onChange={(e) =>
                          onUpdatePlatform(pid, { webhookEndpoint: e.target.value })
                        }
                        placeholder={`https://api.yourdomain.com/publish/${pid}`}
                        className="w-full bg-white dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div className="pt-1 border-t border-blue-200/80 dark:border-blue-900/70">
                      <button
                        type="button"
                        onClick={() => setExpandedGuide(isGuideOpen ? null : pid)}
                        className="w-full flex items-center justify-between text-xs text-blue-800/80 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100 py-1"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Live API Setup Instructions</span>
                        </span>
                        {isGuideOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isGuideOpen && (
                        <ol className="mt-2 space-y-1.5 pl-4 list-decimal text-xs text-blue-800/80 dark:text-blue-200/75 leading-relaxed">
                          {conn.setupSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
