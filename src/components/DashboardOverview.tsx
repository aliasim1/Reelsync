import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Film,
  Globe,
  Layers,
  ListVideo,
  Lock,
  MessageCircle,
  Moon,
  Play,
  PlugZap,
  Plus,
  Radio,
  Shield,
  Sun,
  Upload,
  Users,
} from 'lucide-react';
import { PLATFORM_ORDER, ROLE_PERMISSIONS } from '../data/initialState';
import { TranslationStrings } from '../i18n/translations';
import {
  ActiveWorkspaceView,
  AdminSectionTab,
  GmailSupportConfig,
  MediaChannelEntry,
  PlatformConnection,
  PlatformId,
  ReelItem,
  TeamMember,
  ThemeMode,
  UserRole,
  WhatsAppConfig,
} from '../types/reelsync';
import { formatDuration } from '../utils/videoInspector';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';
import { GmailEnvelopeMark } from './SupportWidgets';
import { WhatsAppIcon } from './WhatsAppChatWidget';

interface DashboardOverviewProps {
  reels: ReelItem[];
  platforms: Record<PlatformId, PlatformConnection>;
  mediaChannels: MediaChannelEntry[];
  teamMembers: TeamMember[];
  isOwnerAdmin: boolean;
  currentRole: UserRole;
  currentUserName: string;
  whatsAppConfig: WhatsAppConfig;
  gmailConfig: GmailSupportConfig;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  onSelectView: (view: ActiveWorkspaceView, adminSection?: AdminSectionTab) => void;
  onOpenAccountsModal: () => void;
  onNewReel: () => void;
  onPreviewReel: (reel: ReelItem) => void;
  onEditReel: (reel: ReelItem) => void;
  onChangeSessionRoleDirect: (role: UserRole) => void;
  onOpenHelpBot: () => void;
  t: TranslationStrings;
}

const ROLE_ORDER: UserRole[] = ['admin', 'creator', 'editor', 'viewer'];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  reels,
  platforms,
  mediaChannels,
  teamMembers,
  isOwnerAdmin,
  currentRole,
  currentUserName,
  whatsAppConfig,
  gmailConfig,
  theme,
  onChangeTheme,
  onSelectView,
  onOpenAccountsModal,
  onNewReel,
  onPreviewReel,
  onEditReel,
  onChangeSessionRoleDirect,
  onOpenHelpBot,
  t,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const isAdmin = isOwnerAdmin && ROLE_PERMISSIONS[currentRole].canManageAdminAndUrls;

  const stats = useMemo(() => {
    const connectedCount = PLATFORM_ORDER.filter(
      (pid) => platforms[pid].connected
    ).length;

    let publishedJobs = 0;
    let scheduledOrQueued = 0;
    let needsAttention = 0;

    reels.forEach((reel) => {
      const states = Object.values(reel.platforms).filter((s) => s.enabled);
      states.forEach((s) => {
        if (s.status === 'published') publishedJobs += 1;
        if (s.status === 'queued' || s.status === 'uploading') {
          scheduledOrQueued += 1;
        }
        if (s.status === 'needs_api_setup' || s.status === 'failed') {
          needsAttention += 1;
        }
      });
    });

    return {
      connectedCount,
      publishedJobs,
      scheduledOrQueued,
      needsAttention,
      totalReels: reels.length,
    };
  }, [reels, platforms]);

  const platformBreakdown = useMemo(() => {
    const map = {} as Record<
      PlatformId,
      { published: number; queued: number; attention: number }
    >;
    PLATFORM_ORDER.forEach((pid) => {
      map[pid] = { published: 0, queued: 0, attention: 0 };
    });
    reels.forEach((reel) => {
      PLATFORM_ORDER.forEach((pid) => {
        const st = reel.platforms[pid];
        if (!st || !st.enabled) return;
        if (st.status === 'published') map[pid].published += 1;
        else if (st.status === 'queued' || st.status === 'uploading')
          map[pid].queued += 1;
        else if (st.status === 'needs_api_setup' || st.status === 'failed')
          map[pid].attention += 1;
      });
    });
    return map;
  }, [reels]);

  const recentReels = useMemo(() => reels.slice(0, 4), [reels]);
  const activePlatformDetail = selectedPlatform
    ? platforms[selectedPlatform]
    : null;

  return (
    <div className="space-y-6 pb-4">
      {/* Studio Welcome Banner with Bespoke Visual Depth */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-[#0A1A38]/90 backdrop-blur-xl border border-blue-200/90 dark:border-blue-800/70 p-6 sm:p-7 shadow-sm dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]"
      >
        {/* Top Luminous Hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/75 to-transparent"
        />
        {/* Soft Atmospheric Right-Side Studio Artwork Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none hidden lg:block absolute inset-y-0 right-0 w-[44%] opacity-25 dark:opacity-35"
        >
          <img
            src="/src/assets/images/studio_blue_showcase_1795440203488.jpg"
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#0A1A38] dark:via-[#0A1A38]/80 dark:to-transparent" />
        </div>

        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-blue-800/80 dark:text-blue-200/75">
              <span className="font-medium text-blue-700 dark:text-blue-400">
                {t.dashControlCenter}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.dashSignedInAs} {currentUserName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize font-semibold text-blue-900 dark:text-blue-200">
                {isOwnerAdmin ? `${currentRole} Mode` : t.dashCreatorWorkspace}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-[1.7rem] font-bold tracking-tight text-blue-950 dark:text-blue-50 text-balance leading-tight">
              {t.dashTitle}
            </h1>
            <p className="text-sm text-blue-900/75 dark:text-blue-200/75 leading-relaxed">
              {isOwnerAdmin ? t.dashSubtitleAdmin : t.dashSubtitleUser}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Bright / Dark Blue Theme Switch */}
            <div className="inline-flex items-center gap-1 p-1 bg-[#EAF2FF]/90 dark:bg-[#051024]/90 border border-blue-200 dark:border-blue-900/80 rounded-xl">
              <button
                type="button"
                onClick={() => onChangeTheme('light')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  theme === 'light'
                    ? 'bg-white text-blue-950 shadow-xs'
                    : 'text-blue-800/75 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.brightShort}</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('dark')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  theme === 'dark'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-blue-800/75 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-blue-300" />
                <span>{t.darkShort}</span>
              </button>
            </div>

            {/* Role Switcher — Visible ONLY to Owner Admin */}
            {isOwnerAdmin && (
              <div className="inline-flex items-center gap-1 p-1 bg-[#EAF2FF]/90 dark:bg-[#051024]/90 border border-blue-200 dark:border-blue-900/80 rounded-xl">
                {ROLE_ORDER.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onChangeSessionRoleDirect(role)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                      currentRole === role
                        ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950'
                        : 'text-blue-800/75 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onNewReel}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 dark:from-blue-500 dark:to-sky-400 dark:hover:from-blue-400 dark:hover:to-sky-300 text-white dark:text-slate-950 shadow-md shadow-blue-600/15 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t.dashUploadReel}</span>
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Top 4 Clickable KPI Metric Cards */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Workspace Metrics"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => onSelectView('queue')}
          className="group relative overflow-hidden text-left rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-600 p-4.5 shadow-sm dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)] transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-blue-800/80 dark:text-blue-300/80">
              {t.dashTotalReels}
            </p>
            <div className="w-7 h-7 rounded-lg bg-blue-500/12 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-blue-950 dark:text-blue-50 font-mono tabular-nums mt-2">
            {stats.totalReels}
          </p>
          <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1.5 font-mono tabular-nums">
            {stats.publishedJobs} published · {stats.scheduledOrQueued} queued
          </p>
        </motion.button>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={onOpenAccountsModal}
          className="group relative overflow-hidden text-left rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-600 p-4.5 shadow-sm dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)] transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-blue-800/80 dark:text-blue-300/80">
              {t.dashConnectedChannels}
            </p>
            <div className="w-7 h-7 rounded-lg bg-sky-500/12 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-display text-3xl font-bold text-blue-950 dark:text-blue-50 font-mono tabular-nums mt-2">
            {stats.connectedCount} / {PLATFORM_ORDER.length}
          </p>
          <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1.5">
            {stats.needsAttention > 0
              ? `${stats.needsAttention} target needs setup`
              : 'All enabled APIs ready'}
          </p>
        </motion.button>

        {isOwnerAdmin ? (
          <>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => onSelectView('admin', 'channels')}
              className="group relative overflow-hidden text-left rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-600 p-4.5 shadow-sm dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-blue-800/80 dark:text-blue-300/80">
                  {t.navAdminChannels}
                </p>
                <div className="w-7 h-7 rounded-lg bg-blue-500/12 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold text-blue-950 dark:text-blue-50 font-mono tabular-nums mt-2">
                {mediaChannels.length}
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1.5">
                Primary & custom URLs configured
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => onSelectView('admin', 'roles')}
              className="group relative overflow-hidden text-left rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-600 p-4.5 shadow-sm dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-blue-800/80 dark:text-blue-300/80">
                  {t.navAdminRoles}
                </p>
                <div className="w-7 h-7 rounded-lg bg-blue-500/12 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold text-blue-950 dark:text-blue-50 font-mono tabular-nums mt-2">
                {teamMembers.length}
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1.5 capitalize">
                Current role: {currentRole}
              </p>
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => onSelectView('queue')}
              className="group relative overflow-hidden text-left rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-600 p-4.5 shadow-sm dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-blue-800/80 dark:text-blue-300/80">
                  {t.dashScheduledQueued}
                </p>
                <div className="w-7 h-7 rounded-lg bg-blue-500/12 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold text-blue-950 dark:text-blue-50 font-mono tabular-nums mt-2">
                {stats.scheduledOrQueued}
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1.5">
                Pending automated drops
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => onSelectView('composer')}
              className="group relative overflow-hidden text-left rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-600 p-4.5 shadow-sm dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.8)] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-blue-800/80 dark:text-blue-300/80">
                  {t.dashPublishedDrops}
                </p>
                <div className="w-7 h-7 rounded-lg bg-blue-500/12 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="font-display text-3xl font-bold text-blue-950 dark:text-blue-50 font-mono tabular-nums mt-2">
                {stats.publishedJobs}
              </p>
              <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1.5">
                Synced across active feeds
              </p>
            </motion.button>
          </>
        )}
      </motion.section>

      {/* Primary Split: User Options vs Admin Options (Hairline Lists — Zero Nested Box Clutter) */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`grid grid-cols-1 ${isOwnerAdmin ? 'lg:grid-cols-2' : ''} gap-6 items-stretch`}
      >
        {/* LEFT PANEL: User & Creator Options */}
        <div className="rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 p-5 sm:p-6 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-semibold text-blue-950 dark:text-blue-50">
                {t.dashUserOptionsTitle}
              </h2>
              <p className="text-xs text-blue-800/75 dark:text-blue-200/75 mt-0.5">
                {t.dashUserOptionsSub}
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-blue-700 dark:text-blue-400 shrink-0">
              Creator Flow
            </span>
          </div>

          <div className="divide-y divide-blue-200/75 dark:divide-blue-900/70 border-y border-blue-200/75 dark:border-blue-900/70">
            <button
              type="button"
              onClick={() => onSelectView('composer')}
              className="w-full group flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-xl hover:bg-blue-500/6 dark:hover:bg-blue-500/8 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600/12 border border-blue-500/25 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-950 dark:text-blue-50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {t.dashUploadComposeTitle}
                  </p>
                  <p className="text-xs text-blue-800/75 dark:text-blue-200/70 truncate">
                    {t.dashUploadComposeSub}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-700/60 dark:text-blue-400/60 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onSelectView('queue')}
              className="w-full group flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-xl hover:bg-blue-500/6 dark:hover:bg-blue-500/8 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500/12 border border-sky-500/25 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
                  <ListVideo className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-950 dark:text-blue-50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {t.dashQueueStatusTitle}
                  </p>
                  <p className="text-xs text-blue-800/75 dark:text-blue-200/70 truncate">
                    {t.dashQueueStatusSub}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-700/60 dark:text-blue-400/60 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            <button
              type="button"
              onClick={onOpenAccountsModal}
              className="w-full group flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-xl hover:bg-blue-500/6 dark:hover:bg-blue-500/8 transition-colors text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/12 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <PlugZap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-950 dark:text-blue-50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {t.dashConnectedSocialTitle}
                  </p>
                  <p className="text-xs text-blue-800/75 dark:text-blue-200/70 truncate font-mono tabular-nums">
                    {t.dashConnectedSocialSub} ({stats.connectedCount}/4 active)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-700/60 dark:text-blue-400/60 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>

          {/* Direct Support Row */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-blue-800/75 dark:text-blue-300/75">
              {t.dashCreatorSupport}
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {whatsAppConfig.enabled && (
                <a
                  href={`https://wa.me/${whatsAppConfig.phoneNumber
                    .replace(/[^\d]/g, '')
                    .replace(/^0(3\d{9})$/, '92$1')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-950 dark:text-blue-100 hover:text-blue-600 dark:hover:text-[#25D366] transition-colors font-mono"
                >
                  <span className="text-[#16a34a] dark:text-[#25D366]">
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>{whatsAppConfig.phoneNumber}</span>
                </a>
              )}
              {gmailConfig.enabled && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    gmailConfig.email
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-950 dark:text-blue-100 hover:text-red-600 dark:hover:text-red-300 transition-colors font-mono"
                >
                  <GmailEnvelopeMark className="w-3.5 h-3.5" />
                  <span>{gmailConfig.email}</span>
                </a>
              )}
              <button
                type="button"
                onClick={onOpenHelpBot}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/12 hover:bg-blue-500/20 text-blue-900 dark:text-blue-200 font-medium transition-colors whitespace-nowrap"
              >
                <Bot className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                <span>{t.botTitle}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Admin Options — Visible ONLY to Verified Owner Admin */}
        {isOwnerAdmin && (
          <div className="rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 p-5 sm:p-6 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-blue-950 dark:text-blue-50">
                  Admin Options & Governance
                </h2>
                <p className="text-xs text-blue-800/75 dark:text-blue-200/75 mt-0.5">
                  Configure destination channel URLs, manage user roles, and edit support endpoints.
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${
                  isAdmin
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {isAdmin ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Unlocked</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>View Only ({currentRole})</span>
                  </>
                )}
              </span>
            </div>

            <div className="divide-y divide-blue-200/75 dark:divide-blue-900/70 border-y border-blue-200/75 dark:border-blue-900/70">
              <button
                type="button"
                onClick={() => onSelectView('admin', 'channels')}
                className="w-full group flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-xl hover:bg-blue-500/6 dark:hover:bg-blue-500/8 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/12 border border-blue-500/25 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-950 dark:text-blue-50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {t.navAdminChannels}
                    </p>
                    <p className="text-xs text-blue-800/75 dark:text-blue-200/70 truncate">
                      Edit primary URLs & add secondary brand channels ({mediaChannels.length} saved)
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-700/60 dark:text-blue-400/60 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onSelectView('admin', 'roles')}
                className="w-full group flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-xl hover:bg-blue-500/6 dark:hover:bg-blue-500/8 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/12 border border-blue-500/25 flex items-center justify-center text-blue-800 dark:text-blue-200 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-950 dark:text-blue-50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {t.navAdminRoles}
                    </p>
                    <p className="text-xs text-blue-800/75 dark:text-blue-200/70 truncate">
                      Assign Admin, Creator, Editor, or Viewer permissions ({teamMembers.length} users)
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-700/60 dark:text-blue-400/60 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onSelectView('admin', 'support')}
                className="w-full group flex items-center justify-between gap-3 py-3.5 px-2 -mx-2 rounded-xl hover:bg-blue-500/6 dark:hover:bg-blue-500/8 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366]/12 border border-[#25D366]/25 flex items-center justify-center text-[#16a34a] dark:text-[#25D366] shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-950 dark:text-blue-50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {t.navAdminSupport}
                    </p>
                    <p className="text-xs text-blue-800/75 dark:text-blue-200/70 truncate">
                      Manage support phone ({whatsAppConfig.phoneNumber}) & Gmail ({gmailConfig.email})
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-700/60 dark:text-blue-400/60 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between gap-3 text-xs text-blue-800/75 dark:text-blue-300/75">
              <span className="truncate">{ROLE_PERMISSIONS[currentRole].summary}</span>
            </div>
          </div>
        )}
      </motion.section>

      {/* Distribution Channels Interactive Cards */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        aria-label="Distribution Channels"
        className="space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-blue-950 dark:text-blue-100">
            {t.dashChannelsHeading}
          </h2>
          <span className="text-xs text-blue-700/75 dark:text-blue-300/70">
            {t.dashChannelsHint}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLATFORM_ORDER.map((pid) => {
            const conn = platforms[pid];
            const counts = platformBreakdown[pid];
            const isSelected = selectedPlatform === pid;

            return (
              <motion.div
                key={pid}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  setSelectedPlatform((prev) => (prev === pid ? null : pid))
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPlatform((prev) => (prev === pid ? null : pid));
                  }
                }}
                className={`relative overflow-hidden text-left rounded-2xl p-4.5 backdrop-blur-md border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSelected
                    ? 'bg-white dark:bg-[#0F264D] border-blue-500 shadow-lg ring-1 ring-blue-500/25'
                    : 'bg-white/90 dark:bg-[#0A1A38]/85 border-blue-200/90 dark:border-blue-900/70 hover:border-blue-400 dark:hover:border-blue-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] dark:bg-[#051024] border border-blue-200/90 dark:border-blue-900/80 flex items-center justify-center shrink-0">
                      <span className={getPlatformAccentText(pid)}>
                        <PlatformIcon platformId={pid} className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-950 dark:text-blue-50 truncate">
                        {conn.name}
                      </p>
                      <p className="text-xs font-mono text-blue-700/80 dark:text-blue-300/75 truncate">
                        {conn.handle}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-medium shrink-0 ${
                      !conn.connected
                        ? 'text-amber-600 dark:text-amber-400'
                        : conn.apiMode === 'live'
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-blue-600 dark:text-sky-300'
                    }`}
                  >
                    {!conn.connected
                      ? 'Setup Needed'
                      : conn.apiMode === 'live'
                      ? 'Live API'
                      : 'Sandbox'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200/80 dark:border-blue-900/70 flex items-center justify-between text-xs font-mono tabular-nums text-blue-800/80 dark:text-blue-200/75">
                  <span>{counts.published} live</span>
                  <span aria-hidden="true">·</span>
                  <span>{counts.queued} queued</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      counts.attention > 0 ? 'text-amber-600 dark:text-amber-400' : ''
                    }
                  >
                    {counts.attention} alert
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {activePlatformDetail && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl bg-white/95 dark:bg-[#0F264D] backdrop-blur-md border border-blue-400 dark:border-blue-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                  <span className={getPlatformAccentText(activePlatformDetail.id)}>
                    <PlatformIcon
                      platformId={activePlatformDetail.id}
                      className="w-4 h-4"
                    />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-blue-950 dark:text-blue-50">
                    {activePlatformDetail.name} · {activePlatformDetail.handle}
                  </p>
                  <a
                    href={activePlatformDetail.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-blue-700 dark:text-blue-400 hover:underline mt-0.5 truncate max-w-full"
                  >
                    <span className="truncate">{activePlatformDetail.channelUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onOpenAccountsModal}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100 transition-colors whitespace-nowrap"
                >
                  {isOwnerAdmin ? 'API & Connection' : t.navAccountsUser}
                </button>
                {isOwnerAdmin && (
                  <button
                    type="button"
                    onClick={() => onSelectView('admin', 'channels')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100 transition-colors whitespace-nowrap"
                  >
                    Edit Channel URL
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectView('composer')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 transition-colors whitespace-nowrap"
                >
                  Create Reel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Recent & Scheduled Reels */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 p-5 sm:p-6 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-semibold text-blue-950 dark:text-blue-50">
              {t.dashRecentReelsHeading}
            </h2>
            <p className="text-xs text-blue-800/75 dark:text-blue-200/70 mt-0.5">
              {t.dashRecentReelsSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectView('queue')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {t.dashOpenFullQueue} ({reels.length})
            </span>
          </button>
        </div>

        {recentReels.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Film className="w-7 h-7 text-blue-600 dark:text-blue-400 mx-auto" />
            <p className="text-sm text-blue-900 dark:text-blue-200">
              No reels queued yet
            </p>
            <button
              type="button"
              onClick={onNewReel}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-slate-950 transition-colors"
            >
              Upload First Reel
            </button>
          </div>
        ) : (
          <div className="divide-y divide-blue-200/80 dark:divide-blue-900/70">
            {recentReels.map((reel) => {
              const enabledTargets = PLATFORM_ORDER.filter(
                (pid) => reel.platforms[pid]?.enabled
              );
              const publishedCount = enabledTargets.filter(
                (pid) => reel.platforms[pid].status === 'published'
              ).length;

              return (
                <div
                  key={reel.id}
                  className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4 hover:bg-blue-500/4 dark:hover:bg-blue-500/6 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onPreviewReel(reel)}
                      aria-label={`Preview ${reel.title}`}
                      className="group relative w-11 aspect-[9/16] rounded-lg overflow-hidden bg-blue-950 border border-blue-200 dark:border-blue-800 shrink-0 shadow-xs"
                    >
                      {reel.thumbnailUrl ? (
                        <img
                          src={reel.thumbnailUrl}
                          alt={reel.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </button>

                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onPreviewReel(reel)}
                        className="text-left text-sm font-medium text-blue-950 dark:text-blue-50 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate block max-w-full"
                      >
                        {reel.title}
                      </button>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-blue-800/75 dark:text-blue-300/70 mt-0.5 font-mono tabular-nums">
                        <span>{formatDuration(reel.metadata.durationSec)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {publishedCount}/{enabledTargets.length} live
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>By {reel.authorName}</span>
                        {reel.publishMode === 'schedule' && reel.scheduledFor && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400">
                              <Calendar className="w-3 h-3" />
                              {reel.scheduledFor.replace('T', ' ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      {enabledTargets.map((pid) => (
                        <span
                          key={pid}
                          title={`${platforms[pid].shortName}: ${reel.platforms[pid].status}`}
                          className={
                            reel.platforms[pid].status === 'published'
                              ? getPlatformAccentText(pid)
                              : reel.platforms[pid].status === 'needs_api_setup'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-blue-700/60 dark:text-blue-400/60'
                          }
                        >
                          <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                        </span>
                      ))}
                    </div>
                    {ROLE_PERMISSIONS[currentRole].canUploadAndCompose && (
                      <button
                        type="button"
                        onClick={() => onEditReel(reel)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800 hover:border-blue-400 text-blue-900 dark:text-blue-100 transition-colors whitespace-nowrap"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 border-t border-blue-200/80 dark:border-blue-900/70 flex items-center gap-1.5 text-[11px] text-blue-800/70 dark:text-blue-300/70">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Optimistic sandbox queue simulation is enabled for testing workflows.</span>
        </div>
      </motion.section>
    </div>
  );
};
