import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Clapperboard,
  Globe,
  LayoutGrid,
  ListVideo,
  LogOut,
  MessageCircle,
  Moon,
  PlugZap,
  Plus,
  Shield,
  ShieldCheck,
  Sun,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react';
import { PLATFORM_ORDER } from '../data/initialState';
import { TranslationStrings } from '../i18n/translations';
import {
  ActiveWorkspaceView,
  AdminSectionTab,
  PlatformConnection,
  PlatformId,
  SupportedLanguage,
  ThemeMode,
  UserRole,
} from '../types/reelsync';
import { LanguageSelector } from './LanguageSelector';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';

interface SidebarNavProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeView: ActiveWorkspaceView;
  activeAdminSection: AdminSectionTab;
  onSelectView: (view: ActiveWorkspaceView, adminSection?: AdminSectionTab) => void;
  onOpenAccountsModal: () => void;
  onNewReel: () => void;
  platforms: Record<PlatformId, PlatformConnection>;
  isOwnerAdmin: boolean;
  userDisplayName?: string | null;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
  onSignOut: () => void;
  currentRole: UserRole;
  onChangeSessionRoleDirect: (role: UserRole) => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  t: TranslationStrings;
  queueBadgeCount: number;
}

const ROLE_ORDER: UserRole[] = ['admin', 'creator', 'editor', 'viewer'];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isMobileOpen,
  onCloseMobile,
  activeView,
  activeAdminSection,
  onSelectView,
  onOpenAccountsModal,
  onNewReel,
  platforms,
  isOwnerAdmin,
  userDisplayName,
  userEmail,
  userAvatarUrl,
  onSignOut,
  currentRole,
  onChangeSessionRoleDirect,
  theme,
  onChangeTheme,
  language,
  onChangeLanguage,
  t,
  queueBadgeCount,
}) => {
  const handleNav = (view: ActiveWorkspaceView, adminSec?: AdminSectionTab) => {
    onSelectView(view, adminSec);
    onCloseMobile();
  };

  const renderNavItem = ({
    id,
    active,
    icon: Icon,
    label,
    onClick,
    rightSlot,
  }: {
    id: string;
    active: boolean;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick: () => void;
    rightSlot?: React.ReactNode;
  }) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      className={`relative w-full flex items-center justify-between gap-2.5 px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
        active
          ? 'text-blue-950 dark:text-white'
          : 'text-blue-800/80 hover:text-blue-950 hover:bg-blue-500/8 dark:text-blue-200/75 dark:hover:text-white dark:hover:bg-blue-500/10'
      }`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-bg"
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-xl bg-blue-500/15 dark:bg-blue-500/18 border border-blue-500/30 dark:border-blue-400/25 shadow-xs"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2.5 truncate">
        <Icon
          className={`w-4 h-4 shrink-0 ${
            active
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-blue-700/75 dark:text-blue-300/75'
          }`}
        />
        <span className="truncate">{label}</span>
      </span>
      {rightSlot && <span className="relative z-10 shrink-0">{rightSlot}</span>}
    </button>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/90 dark:bg-[#07132A]/95 backdrop-blur-xl border-r border-blue-200/90 dark:border-blue-900/70 w-64">
      {/* Brand Lockup */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-blue-200/80 dark:border-blue-900/70 shrink-0">
        <button
          type="button"
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-2.5 text-blue-950 dark:text-blue-50 hover:opacity-85 transition-opacity whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/10 border border-blue-500/35 flex items-center justify-center text-blue-700 dark:text-blue-300">
            <Clapperboard className="w-4 h-4" />
          </div>
          <span className="font-display text-base font-bold tracking-tight">
            ReelSync
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="lg:hidden p-2 rounded-lg text-blue-700 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-50 dark:hover:bg-blue-900/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Studio CTA */}
      <div className="p-4 border-b border-blue-200/70 dark:border-blue-900/60">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => {
            onNewReel();
            onCloseMobile();
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 dark:from-blue-500 dark:to-sky-400 dark:hover:from-blue-400 dark:hover:to-sky-300 text-white dark:text-slate-950 shadow-md shadow-blue-600/15 dark:shadow-blue-500/15 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{t.newReelUpload}</span>
        </motion.button>
      </div>

      {/* Scrollable Nav Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* User & Creator Options */}
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold text-blue-700/75 dark:text-blue-300/70">
            {t.userWorkspace}
          </p>

          {renderNavItem({
            id: 'dashboard',
            active: activeView === 'dashboard',
            icon: LayoutGrid,
            label: t.navDashboard,
            onClick: () => handleNav('dashboard'),
          })}

          {renderNavItem({
            id: 'composer',
            active: activeView === 'composer',
            icon: Upload,
            label: t.navComposer,
            onClick: () => handleNav('composer'),
          })}

          {renderNavItem({
            id: 'queue',
            active: activeView === 'queue',
            icon: ListVideo,
            label: t.navQueue,
            onClick: () => handleNav('queue'),
            rightSlot:
              queueBadgeCount > 0 ? (
                <span className="font-mono tabular-nums text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                  {queueBadgeCount}
                </span>
              ) : undefined,
          })}

          <button
            type="button"
            onClick={() => {
              onOpenAccountsModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 min-h-[40px] rounded-xl text-xs font-medium text-blue-800/80 hover:text-blue-950 hover:bg-blue-500/8 dark:text-blue-200/75 dark:hover:text-white dark:hover:bg-blue-500/10 transition-colors whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-2.5 truncate">
              <PlugZap className="w-4 h-4 shrink-0 text-blue-700/75 dark:text-blue-300/75" />
              <span className="truncate">
                {isOwnerAdmin ? t.navAccountsAdmin : t.navAccountsUser}
              </span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {PLATFORM_ORDER.map((pid) => (
                <span
                  key={pid}
                  className={
                    platforms[pid].connected
                      ? getPlatformAccentText(pid)
                      : 'text-blue-300 dark:text-blue-800'
                  }
                >
                  <PlatformIcon platformId={pid} className="w-2.5 h-2.5" />
                </span>
              ))}
            </span>
          </button>
        </div>

        {/* Admin Options — Visible ONLY to Verified Owner Admin */}
        {isOwnerAdmin && (
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold text-blue-700/75 dark:text-blue-300/70">
              {t.adminOptions}
            </p>

            {renderNavItem({
              id: 'admin-channels',
              active: activeView === 'admin' && activeAdminSection === 'channels',
              icon: Globe,
              label: t.navAdminChannels,
              onClick: () => handleNav('admin', 'channels'),
            })}

            {renderNavItem({
              id: 'admin-roles',
              active: activeView === 'admin' && activeAdminSection === 'roles',
              icon: Users,
              label: t.navAdminRoles,
              onClick: () => handleNav('admin', 'roles'),
            })}

            {renderNavItem({
              id: 'admin-support',
              active: activeView === 'admin' && activeAdminSection === 'support',
              icon: MessageCircle,
              label: t.navAdminSupport,
              onClick: () => handleNav('admin', 'support'),
            })}
          </div>
        )}

        {/* Language & Theme Switcher */}
        <div className="space-y-2.5 px-1 pt-2 border-t border-blue-200/70 dark:border-blue-900/60">
          <p className="px-2 text-[11px] font-semibold text-blue-700/75 dark:text-blue-300/70">
            {t.appearance}
          </p>

          <div className="grid grid-cols-2 gap-1 p-1 bg-[#EAF2FF] dark:bg-[#040B1A] border border-blue-200 dark:border-blue-900/80 rounded-xl">
            <button
              type="button"
              onClick={() => onChangeTheme('light')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-blue-800/70 hover:text-blue-950 dark:text-blue-300/70 dark:hover:text-blue-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.brightShort}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('dark')}
              className={`inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-blue-800/70 hover:text-blue-950 dark:text-blue-300/70 dark:hover:text-blue-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-blue-300" />
              <span>{t.darkShort}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
            <span className="text-[11px] text-blue-800/80 dark:text-blue-300/75 truncate">
              {t.languageLabel}
            </span>
            <LanguageSelector
              language={language}
              onChangeLanguage={onChangeLanguage}
              ariaLabel={t.languageLabel}
              compact
            />
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-blue-200/90 dark:border-blue-900/70 bg-[#F2F7FF] dark:bg-[#051024] space-y-3 shrink-0">
        {isOwnerAdmin ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userDisplayName || t.ownerAdminLabel}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-blue-300 dark:border-blue-700 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-500/40 flex items-center justify-center text-blue-700 dark:text-blue-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-blue-950 dark:text-blue-50 truncate">
                  {userDisplayName || t.ownerAdminLabel}
                </p>
                <p className="text-[11px] font-mono text-blue-700/80 dark:text-blue-300/70 truncate">
                  {userEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                title={t.signOut}
                aria-label={t.signOut}
                className="p-2 rounded-lg text-blue-700 hover:text-red-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-red-400 dark:hover:bg-blue-900/50 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-blue-800/80 dark:text-blue-300/80">
                <span className="inline-flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Preview Role</span>
                </span>
                <span className="capitalize font-medium text-blue-950 dark:text-blue-100">
                  {currentRole}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#EAF2FF] dark:bg-[#040B1A] border border-blue-200 dark:border-blue-900/80 rounded-lg">
                {ROLE_ORDER.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onChangeSessionRoleDirect(role)}
                    className={`py-1 rounded text-[10px] font-medium capitalize transition-colors ${
                      currentRole === role
                        ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950'
                        : 'text-blue-800/75 hover:text-blue-950 dark:text-blue-300/70 dark:hover:text-blue-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userDisplayName || 'Creator'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-blue-300 dark:border-blue-700 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/70 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-800 dark:text-blue-200 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-blue-950 dark:text-blue-50 truncate">
                  {userDisplayName || 'Creator'}
                </p>
                <p className="text-[11px] font-mono text-blue-700/80 dark:text-blue-300/70 truncate">
                  {userEmail || t.creatorAccessLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                title={t.signOut}
                aria-label={t.signOut}
                className="p-2 rounded-lg text-blue-700 hover:text-red-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-red-400 dark:hover:bg-blue-900/50 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium text-blue-800/85 hover:text-blue-950 bg-[#EAF2FF] hover:bg-blue-100 dark:text-blue-300/85 dark:hover:text-blue-50 dark:bg-[#040B1A] dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/80 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3 h-3" />
              <span>{t.signOut}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={onCloseMobile}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: language === 'ur' || language === 'ar' ? 260 : -260 }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ur' || language === 'ar' ? 260 : -260 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
