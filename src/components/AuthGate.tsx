import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clapperboard,
  Globe,
  Layers,
  LogOut,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from 'lucide-react';
import { PLATFORM_ORDER } from '../data/initialState';
import { LANGUAGE_OPTIONS, TranslationStrings } from '../i18n/translations';
import { SupportedLanguage, ThemeMode } from '../types/reelsync';
import { LanguageSelector } from './LanguageSelector';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';

interface AuthGateProps {
  mode: 'sign-in' | 'onboarding';
  authUser: User | null;
  isAuthBusy: boolean;
  isSavingProfile: boolean;
  language: SupportedLanguage;
  theme: ThemeMode;
  t: TranslationStrings;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onSignInWithEmail: () => void;
  onCompleteAccount: (displayName: string, language: SupportedLanguage) => Promise<void>;
  onSwitchAccount: () => void;
}

const PLATFORM_NAMES = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  snapchat: 'Snapchat',
} as const;

export const AuthGate: React.FC<AuthGateProps> = ({
  mode,
  authUser,
  isAuthBusy,
  isSavingProfile,
  language,
  theme,
  t,
  onChangeLanguage,
  onChangeTheme,
  onSignInWithEmail,
  onCompleteAccount,
  onSwitchAccount,
}) => {
  const [displayName, setDisplayName] = useState(
    authUser?.displayName?.trim() || ''
  );
  const [formError, setFormError] = useState('');
  const isRtl = language === 'ur' || language === 'ar';

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = displayName.trim();
    if (cleaned.length < 2) {
      setFormError('Please enter at least 2 characters for your display name.');
      return;
    }
    setFormError('');
    await onCompleteAccount(cleaned, language);
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#EAF2FF] dark:bg-[#040B1A] text-blue-950 dark:text-blue-50 flex flex-col relative overflow-hidden"
    >
      {/* Subtle Studio Grid & Ambient Blue Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 studio-canvas-grid opacity-75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(59,130,246,0.22),transparent)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(59,130,246,0.18),transparent)]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -14, 0], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-28 right-1/4 w-[28rem] h-[28rem] rounded-full bg-blue-400/20 dark:bg-blue-500/12 blur-3xl"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-[1220px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/10 border border-blue-500/35 flex items-center justify-center text-blue-700 dark:text-blue-300 shadow-xs">
            <Clapperboard className="w-4 h-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            ReelSync
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <LanguageSelector
            language={language}
            onChangeLanguage={onChangeLanguage}
            ariaLabel={t.languageLabel}
          />
          <button
            type="button"
            onClick={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/85 dark:bg-[#0A1A38]/90 border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 text-blue-900 dark:text-blue-100 transition-colors whitespace-nowrap shrink-0 min-h-[34px]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.brightTheme}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">{t.darkTheme}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Centered Split Studio Showcase + Gate */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-[1140px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Editorial Studio Showcase & Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-blue-700 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{t.authStepBadge}</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight text-blue-950 dark:text-blue-50 text-balance leading-[1.12]">
                {t.authHeadline}
              </h1>
              <p className="text-sm sm:text-base text-blue-900/75 dark:text-blue-200/75 leading-relaxed max-w-xl">
                {t.authSubheadline}
              </p>
            </div>

            {/* Bespoke Studio Visual Showcase */}
            <div className="relative rounded-2xl overflow-hidden border border-blue-200/90 dark:border-blue-800/75 bg-[#051024] shadow-xl dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src="/src/assets/images/studio_blue_showcase_1795440203488.jpg"
                  alt="ReelSync multi-platform short-form video creator studio desk"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#040B1A] via-[#040B1A]/35 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-blue-50">
                <div className="flex items-center gap-3">
                  {PLATFORM_ORDER.map((pid) => (
                    <span
                      key={pid}
                      title={PLATFORM_NAMES[pid]}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-100/90"
                    >
                      <span className={getPlatformAccentText(pid)}>
                        <PlatformIcon platformId={pid} className="w-3.5 h-3.5" />
                      </span>
                      <span className="hidden sm:inline">{PLATFORM_NAMES[pid]}</span>
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-mono tabular-nums text-blue-300/90">
                  9:16 · 1080×1920
                </span>
              </div>
            </div>

            {/* Clean Hairline-Divided Studio Capabilities (Zero card-in-card nesting) */}
            <div className="divide-y divide-blue-200/80 dark:divide-blue-900/75 border-y border-blue-200/80 dark:border-blue-900/75">
              {[
                {
                  icon: Layers,
                  title: t.authBenefit1Title,
                  desc: t.authBenefit1Desc,
                },
                {
                  icon: Globe,
                  title: t.authBenefit2Title,
                  desc: t.authBenefit2Desc,
                },
                {
                  icon: Bot,
                  title: t.authBenefit3Title,
                  desc: t.authBenefit3Desc,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: isRtl ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: 0.06 * (idx + 1),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex items-start gap-3.5 py-3.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600/12 dark:bg-blue-500/12 border border-blue-500/25 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-950 dark:text-blue-50">
                        {item.title}
                      </p>
                      <p className="text-xs text-blue-800/75 dark:text-blue-200/75 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Luminous Sign Up / Account Completion Card */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex items-center"
          >
            <div className="relative w-full rounded-2xl bg-white/95 dark:bg-[#0A1A38]/95 backdrop-blur-xl border border-blue-200/90 dark:border-blue-800/80 p-6 sm:p-8 shadow-2xl dark:shadow-[0_28px_80px_-24px_rgba(0,0,0,0.92)] overflow-hidden space-y-6">
              {/* Top Luminous Blue Hairline */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/75 to-transparent"
              />

              {mode === 'sign-in' ? (
                <>
                  <div className="space-y-1.5">
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-50">
                      {t.authEmailButton}
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-800/75 dark:text-blue-200/75 leading-relaxed">
                      {t.authPrivacyNote}
                    </p>
                  </div>

                  {/* Language Pick Grid */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-blue-900 dark:text-blue-200">
                      {t.onboardingLangLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LANGUAGE_OPTIONS.map((opt) => {
                        const active = language === opt.code;
                        return (
                          <button
                            key={opt.code}
                            type="button"
                            onClick={() => onChangeLanguage(opt.code)}
                            className={`px-3 py-2.5 min-h-[42px] rounded-xl text-xs font-medium border transition-all duration-150 text-left flex items-center justify-between gap-1.5 ${
                              active
                                ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:text-slate-950 dark:border-blue-400 shadow-sm'
                                : 'bg-[#F2F7FF] dark:bg-[#051024] text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-700'
                            }`}
                          >
                            <span className="truncate">{opt.nativeLabel}</span>
                            {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Email Sign Up / Sign In CTA */}
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    disabled={isAuthBusy}
                    onClick={onSignInWithEmail}
                    className="group w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 dark:from-blue-500 dark:to-sky-400 dark:hover:from-blue-400 dark:hover:to-sky-300 text-white dark:text-slate-950 shadow-lg shadow-blue-600/20 dark:shadow-blue-500/15 transition-all disabled:opacity-60 whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>{isAuthBusy ? t.authConnecting : t.authEmailButton}</span>
                    <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>

                  <div className="pt-3 border-t border-blue-200/80 dark:border-blue-900/70 flex items-center gap-2.5 text-xs text-blue-800/75 dark:text-blue-300/75">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{t.authPrivacyNote}</span>
                  </div>
                </>
              ) : (
                <form onSubmit={handleCreateAccountSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-50">
                      {t.onboardingTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-800/75 dark:text-blue-200/75">
                      {t.onboardingSubtitle}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="onboarding-email"
                      className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1.5"
                    >
                      {t.onboardingEmailLabel}
                    </label>
                    <div
                      id="onboarding-email"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF2FF] dark:bg-[#040B1A] border border-blue-200 dark:border-blue-900 text-xs font-mono text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{authUser?.email}</span>
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="onboarding-name"
                      className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1.5"
                    >
                      {t.onboardingNameLabel}
                    </label>
                    <input
                      id="onboarding-name"
                      type="text"
                      required
                      maxLength={120}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={t.onboardingNamePlaceholder}
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800 focus:border-blue-500 text-sm text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-blue-800 dark:text-blue-200">
                      {t.onboardingLangLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {LANGUAGE_OPTIONS.map((opt) => {
                        const active = language === opt.code;
                        return (
                          <button
                            key={opt.code}
                            type="button"
                            onClick={() => onChangeLanguage(opt.code)}
                            className={`px-3 py-2 min-h-[40px] rounded-xl text-xs font-medium border transition-all duration-150 text-left flex items-center justify-between gap-1 ${
                              active
                                ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:text-slate-950 dark:border-blue-400'
                                : 'bg-[#F2F7FF] dark:bg-[#051024] text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-900 hover:border-blue-400'
                            }`}
                          >
                            <span className="truncate">{opt.nativeLabel}</span>
                            {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formError && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {formError}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={onSwitchAccount}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-medium bg-[#EAF2FF] hover:bg-blue-100 dark:bg-[#051024] dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 transition-colors whitespace-nowrap"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.onboardingSwitchAccount}</span>
                    </button>

                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 dark:from-blue-500 dark:to-sky-400 dark:hover:from-blue-400 dark:hover:to-sky-300 text-white dark:text-slate-950 shadow-sm transition-all disabled:opacity-60 whitespace-nowrap"
                    >
                      <span>{isSavingProfile ? t.onboardingSaving : t.onboardingSubmit}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
