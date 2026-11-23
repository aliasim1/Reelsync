import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Bot, Clapperboard, LogOut, Menu, Moon, Plus, Sun } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { AuthGate } from './components/AuthGate';
import { ComposerStudio } from './components/ComposerStudio';
import { ConnectedAccountsModal } from './components/ConnectedAccountsModal';
import { DashboardOverview } from './components/DashboardOverview';
import { LanguageSelector } from './components/LanguageSelector';
import { PublishingQueue } from './components/PublishingQueue';
import { ReelPreviewModal } from './components/ReelPreviewModal';
import { SidebarNav } from './components/SidebarNav';
import { SupportWidgets } from './components/SupportWidgets';
import { ToastContainer } from './components/ToastContainer';
import {
  INITIAL_GMAIL_CONFIG,
  INITIAL_MEDIA_CHANNELS,
  INITIAL_PLATFORMS,
  INITIAL_REELS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_WHATSAPP_CONFIG,
  PLATFORM_ORDER,
} from './data/initialState';
import {
  auth,
  buildPrivateCredentialsPayload,
  buildPublicSettingsPayload,
  buildTeamMemberPayload,
  buildUserAccountCreatePayload,
  buildUserAccountUpdatePatch,
  db,
  handleFirestoreError,
  isVerifiedOwnerUser,
  OperationType,
  signInWithGoogleAccount,
  signOutFirebase,
} from './firebase';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from './i18n/translations';
import {
  ActiveWorkspaceView,
  AdminSectionTab,
  GmailSupportConfig,
  MediaChannelEntry,
  PlatformConnection,
  PlatformId,
  PlatformPublishConfig,
  PlatformPublishState,
  ReelItem,
  SupportedLanguage,
  TeamMember,
  ThemeMode,
  ToastMessage,
  UserAccountProfile,
  UserRole,
  VideoMetadata,
  WhatsAppConfig,
} from './types/reelsync';

const STORAGE_KEYS = {
  reels: 'reelsync_reels_v1',
  theme: 'reelsync_theme_v1',
  language: 'reelsync_lang_v1',
};

const VALID_LANGUAGES = new Set<SupportedLanguage>(
  LANGUAGE_OPTIONS.map((opt) => opt.code)
);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [userProfile, setUserProfile] = useState<UserAccountProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const stored = readStorage<SupportedLanguage>(STORAGE_KEYS.language, 'en');
    return VALID_LANGUAGES.has(stored) ? stored : 'en';
  });

  const [activeView, setActiveView] = useState<ActiveWorkspaceView>('dashboard');
  const [activeAdminSection, setActiveAdminSection] =
    useState<AdminSectionTab>('channels');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);
  const [isHelpBotOpen, setIsHelpBotOpen] = useState(false);
  const [draftTriggerKey, setDraftTriggerKey] = useState(0);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);
  const [previewReel, setPreviewReel] = useState<ReelItem | null>(null);

  const [platforms, setPlatforms] = useState<Record<PlatformId, PlatformConnection>>(
    () => structuredClone(INITIAL_PLATFORMS)
  );
  const [mediaChannels, setMediaChannels] = useState<MediaChannelEntry[]>(
    () => structuredClone(INITIAL_MEDIA_CHANNELS)
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    () => structuredClone(INITIAL_TEAM_MEMBERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(
    INITIAL_TEAM_MEMBERS[0].id
  );
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);
  const [reels, setReels] = useState<ReelItem[]>(() =>
    readStorage(STORAGE_KEYS.reels, INITIAL_REELS)
  );
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(
    () => structuredClone(INITIAL_WHATSAPP_CONFIG)
  );
  const [gmailConfig, setGmailConfig] = useState<GmailSupportConfig>(
    () => structuredClone(INITIAL_GMAIL_CONFIG)
  );
  const [theme, setTheme] = useState<ThemeMode>(() =>
    readStorage<ThemeMode>(STORAGE_KEYS.theme, 'dark')
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const timersRef = useRef<number[]>([]);

  const isOwnerAdmin = isVerifiedOwnerUser(authUser);
  const effectiveView: ActiveWorkspaceView =
    activeView === 'admin' && !isOwnerAdmin ? 'dashboard' : activeView;
  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const isRtl = language === 'ur' || language === 'ar';

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (
      variant: ToastMessage['variant'],
      title: string,
      description?: string
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, variant, title, description }]);
      const timer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4500);
      timersRef.current.push(timer);
    },
    []
  );

  // Listen to Firebase Auth state — all verified users can create accounts & enter;
  // only the verified owner email unlocks Admin controls.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (user && user.emailVerified) {
        setProfileLoading(true);
      } else {
        setUserProfile(null);
        setProfileLoading(false);
        setRoleOverride(null);
        setActiveView('dashboard');
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to the signed-in user's /users/{uid} account document
  useEffect(() => {
    if (!authUser || !authUser.emailVerified) return;
    const userPath = `users/${authUser.uid}`;
    const userRef = doc(db, 'users', authUser.uid);

    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserAccountProfile;
          setUserProfile(data);
          if (data.language && VALID_LANGUAGES.has(data.language)) {
            setLanguage(data.language);
          }
        } else {
          setUserProfile(null);
        }
        setProfileLoading(false);
      },
      (err) => {
        setProfileLoading(false);
        handleFirestoreError(err, OperationType.GET, userPath);
      }
    );

    return () => unsub();
  }, [authUser]);

  // Persist language locally and sync to Firestore when account exists
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(language));
    } catch {
      // Ignore storage quota errors
    }
  }, [language]);

  const handleChangeLanguage = useCallback(
    (nextLang: SupportedLanguage) => {
      setLanguage(nextLang);
      if (
        authUser &&
        auth.currentUser?.uid === authUser.uid &&
        userProfile?.onboardingComplete
      ) {
        const path = `users/${authUser.uid}`;
        void updateDoc(
          doc(db, 'users', authUser.uid),
          buildUserAccountUpdatePatch({ language: nextLang })
        ).catch((err) => handleFirestoreError(err, OperationType.UPDATE, path));
      }
    },
    [authUser, userProfile?.onboardingComplete]
  );

  // Persist user's local session reels and theme
  useEffect(() => {
    try {
      const serializableReels = reels.map((r) => ({
        ...r,
        videoObjectUrl: undefined,
        thumbnailUrl:
          r.thumbnailUrl && r.thumbnailUrl.length > 180_000
            ? undefined
            : r.thumbnailUrl,
      }));
      localStorage.setItem(STORAGE_KEYS.reels, JSON.stringify(serializableReels));
    } catch {
      // Ignore storage quota errors
    }
  }, [reels]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
    } catch {
      // Ignore storage quota errors
    }
  }, [theme]);

  // Subscribe to public workspace settings from Firestore once authenticated
  useEffect(() => {
    if (!authReady || !authUser || !authUser.emailVerified) return;

    let cancelled = false;
    const settingsPath = 'workspace_config/public_settings';
    const settingsRef = doc(db, 'workspace_config', 'public_settings');

    const unsub = onSnapshot(
      settingsRef,
      (snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          if (data.platforms && typeof data.platforms === 'object') {
            setPlatforms((prev) => {
              const next = { ...prev };
              PLATFORM_ORDER.forEach((pid) => {
                const remote = data.platforms[pid];
                if (remote && typeof remote === 'object') {
                  next[pid] = {
                    ...prev[pid],
                    ...remote,
                    setupSteps: INITIAL_PLATFORMS[pid].setupSteps,
                    clientId: prev[pid].clientId,
                    webhookEndpoint: prev[pid].webhookEndpoint,
                  };
                }
              });
              return next;
            });
          }
          if (Array.isArray(data.mediaChannels)) {
            setMediaChannels(data.mediaChannels as MediaChannelEntry[]);
          }
          if (data.whatsAppConfig && typeof data.whatsAppConfig === 'object') {
            setWhatsAppConfig(data.whatsAppConfig as WhatsAppConfig);
          }
          if (data.gmailConfig && typeof data.gmailConfig === 'object') {
            setGmailConfig(data.gmailConfig as GmailSupportConfig);
          }
        }
      },
      (err) => {
        if (cancelled || !auth.currentUser) return;
        handleFirestoreError(err, OperationType.GET, settingsPath);
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, [authReady, isOwnerAdmin, authUser]);

  // Owner-Admin-Only listeners for private API credentials and team member directory
  useEffect(() => {
    if (!isOwnerAdmin || !authUser) {
      setTeamMembers(structuredClone(INITIAL_TEAM_MEMBERS));
      setPlatforms((prev) => {
        const cleaned = { ...prev };
        PLATFORM_ORDER.forEach((pid) => {
          cleaned[pid] = {
            ...cleaned[pid],
            clientId: '',
            webhookEndpoint: '',
          };
        });
        return cleaned;
      });
      return;
    }

    let cancelled = false;
    const credPath = 'workspace_private/api_credentials';
    const credRef = doc(db, 'workspace_private', 'api_credentials');
    const unsubCreds = onSnapshot(
      credRef,
      (snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          const d = snap.data();
          setPlatforms((prev) => ({
            tiktok: {
              ...prev.tiktok,
              clientId: typeof d.tiktokClientId === 'string' ? d.tiktokClientId : '',
              webhookEndpoint: typeof d.tiktokWebhook === 'string' ? d.tiktokWebhook : '',
            },
            instagram: {
              ...prev.instagram,
              clientId: typeof d.instagramClientId === 'string' ? d.instagramClientId : '',
              webhookEndpoint: typeof d.instagramWebhook === 'string' ? d.instagramWebhook : '',
            },
            youtube: {
              ...prev.youtube,
              clientId: typeof d.youtubeClientId === 'string' ? d.youtubeClientId : '',
              webhookEndpoint: typeof d.youtubeWebhook === 'string' ? d.youtubeWebhook : '',
            },
            snapchat: {
              ...prev.snapchat,
              clientId: typeof d.snapchatClientId === 'string' ? d.snapchatClientId : '',
              webhookEndpoint: typeof d.snapchatWebhook === 'string' ? d.snapchatWebhook : '',
            },
          }));
        }
      },
      (err) => {
        if (cancelled || !auth.currentUser) return;
        handleFirestoreError(err, OperationType.GET, credPath);
      }
    );

    const teamPath = 'team_members';
    const teamRef = collection(db, 'team_members');
    const unsubTeam = onSnapshot(
      teamRef,
      (snap) => {
        if (cancelled) return;
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as TeamMember);
          setTeamMembers(list);
        }
      },
      (err) => {
        if (cancelled || !auth.currentUser) return;
        handleFirestoreError(err, OperationType.LIST, teamPath);
      }
    );

    return () => {
      cancelled = true;
      unsubCreds();
      unsubTeam();
    };
  }, [isOwnerAdmin, authUser]);

  const persistPublicSettings = useCallback(
    async (
      nextPlatforms: Record<PlatformId, PlatformConnection>,
      nextChannels: MediaChannelEntry[],
      nextWa: WhatsAppConfig,
      nextGmail: GmailSupportConfig
    ) => {
      if (!isOwnerAdmin || !authUser) return;
      const path = 'workspace_config/public_settings';
      try {
        await setDoc(
          doc(db, 'workspace_config', 'public_settings'),
          buildPublicSettingsPayload({
            platforms: nextPlatforms,
            mediaChannels: nextChannels,
            whatsAppConfig: nextWa,
            gmailConfig: nextGmail,
            uid: authUser.uid,
          })
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    },
    [isOwnerAdmin, authUser]
  );

  const persistPrivateCredentials = useCallback(
    async (nextPlatforms: Record<PlatformId, PlatformConnection>) => {
      if (!isOwnerAdmin || !authUser) return;
      const path = 'workspace_private/api_credentials';
      try {
        await setDoc(
          doc(db, 'workspace_private', 'api_credentials'),
          buildPrivateCredentialsPayload(nextPlatforms, authUser.uid)
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    },
    [isOwnerAdmin, authUser]
  );

  const activeUser = useMemo(() => {
    if (!isOwnerAdmin) {
      return {
        id: authUser?.uid || 'visitor',
        name:
          userProfile?.displayName ||
          authUser?.displayName ||
          authUser?.email?.split('@')[0] ||
          'Creator',
        email: authUser?.email || 'user@reelsync.studio',
        role: 'creator' as UserRole,
        status: 'active' as const,
        lastActiveAt: 'Active',
      };
    }
    return (
      teamMembers.find((m) => m.id === currentUserId) ||
      teamMembers[0] || {
        id: 'usr-1',
        name: userProfile?.displayName || authUser?.displayName || 'Owner Admin',
        email: authUser?.email || 'alobli456@gmail.com',
        role: 'admin' as UserRole,
        status: 'active' as const,
        lastActiveAt: 'Just now',
      }
    );
  }, [isOwnerAdmin, teamMembers, currentUserId, authUser, userProfile]);

  const currentRole: UserRole = isOwnerAdmin
    ? roleOverride ?? 'admin'
    : 'creator';

  const handleSignInWithEmail = async () => {
    setIsAuthBusy(true);
    try {
      const user = await signInWithGoogleAccount();
      if (!user.emailVerified || !user.email) {
        await signOutFirebase();
        notify(
          'error',
          'Verified email required',
          'Please sign in with a verified Google email address.'
        );
        return;
      }
      if (isVerifiedOwnerUser(user)) {
        setRoleOverride('admin');
        notify(
          'success',
          'Owner Admin signed in',
          'Your admin controls and workspace settings are unlocked.'
        );
      } else {
        setRoleOverride(null);
        notify(
          'success',
          'Signed in',
          `Connected as ${user.email}`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in cancelled.';
      if (!msg.includes('popup-closed-by-user')) {
        notify('error', 'Sign-in failed', msg);
      }
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleCompleteAccount = async (
    displayName: string,
    selectedLang: SupportedLanguage
  ) => {
    if (!authUser || !authUser.email) return;
    setIsSavingProfile(true);
    const path = `users/${authUser.uid}`;
    const userRef = doc(db, 'users', authUser.uid);

    try {
      await authUser.getIdToken(true);
      if (userProfile) {
        await updateDoc(
          userRef,
          buildUserAccountUpdatePatch({
            displayName,
            photoUrl: authUser.photoURL,
            language: selectedLang,
            onboardingComplete: true,
          })
        );
      } else {
        await setDoc(
          userRef,
          buildUserAccountCreatePayload({
            uid: authUser.uid,
            displayName,
            email: authUser.email,
            photoUrl: authUser.photoURL,
            language: selectedLang,
            onboardingComplete: true,
          })
        );
      }
      setLanguage(selectedLang);
      notify('success', 'Account ready', `Welcome to ReelSync, ${displayName}!`);
    } catch (err) {
      notify(
        'error',
        'Could not save account',
        err instanceof Error ? err.message : 'Please try again.'
      );
      handleFirestoreError(
        err,
        userProfile ? OperationType.UPDATE : OperationType.CREATE,
        path
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOutFirebase();
    setRoleOverride(null);
    setActiveView('dashboard');
    setIsHelpBotOpen(false);
    notify('info', 'Signed out', 'Sign in with your email to continue.');
  };

  // Simulated non-blocking upload progression for connected platforms
  const runSimulatedPublish = useCallback(
    (
      reelId: string,
      platformIds: PlatformId[],
      channelSnapshot: Record<PlatformId, PlatformConnection>
    ) => {
      platformIds.forEach((pid, index) => {
        const conn = channelSnapshot[pid];
        if (!conn.connected || conn.apiMode === 'unconfigured') return;

        const baseDelay = 450 + index * 250;

        const t1 = window.setTimeout(() => {
          setReels((prev) =>
            prev.map((item) =>
              item.id !== reelId
                ? item
                : {
                    ...item,
                    platforms: {
                      ...item.platforms,
                      [pid]: {
                        ...item.platforms[pid],
                        status: 'uploading',
                        progressPct: 35,
                        updatedAt: new Date().toISOString(),
                      },
                    },
                  }
            )
          );
        }, baseDelay);

        const t2 = window.setTimeout(() => {
          setReels((prev) =>
            prev.map((item) =>
              item.id !== reelId
                ? item
                : {
                    ...item,
                    platforms: {
                      ...item.platforms,
                      [pid]: {
                        ...item.platforms[pid],
                        status: 'uploading',
                        progressPct: 78,
                        updatedAt: new Date().toISOString(),
                      },
                    },
                  }
            )
          );
        }, baseDelay + 650);

        const t3 = window.setTimeout(() => {
          const cleanBase = conn.channelUrl.replace(/\/+$/, '');
          const slug = reelId.slice(-5);
          const publishedUrl =
            pid === 'youtube'
              ? `${cleanBase}/shorts`
              : pid === 'tiktok'
              ? `${cleanBase}/video/744${slug}`
              : pid === 'instagram'
              ? `${cleanBase}/reels`
              : cleanBase;

          setReels((prev) =>
            prev.map((item) =>
              item.id !== reelId
                ? item
                : {
                    ...item,
                    platforms: {
                      ...item.platforms,
                      [pid]: {
                        ...item.platforms[pid],
                        status: 'published',
                        progressPct: 100,
                        publishedUrl,
                        errorMessage: undefined,
                        updatedAt: new Date().toISOString(),
                      },
                    },
                  }
            )
          );
          notify(
            'success',
            `Published to ${conn.name}`,
            conn.apiMode === 'sandbox'
              ? 'Simulated sandbox delivery complete.'
              : 'Live API webhook delivery confirmed.'
          );
        }, baseDelay + 1400);

        timersRef.current.push(t1, t2, t3);
      });
    },
    [notify]
  );

  const handleSubmitReel = (payload: {
    id?: string;
    title: string;
    sharedCaption: string;
    coverTimestampSec: number;
    thumbnailUrl?: string;
    videoObjectUrl?: string;
    metadata: VideoMetadata;
    publishMode: 'now' | 'schedule' | 'draft';
    scheduledFor?: string;
    configs: Record<PlatformId, PlatformPublishConfig>;
  }) => {
    const reelId = payload.id || `reel-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const platformStates = {} as Record<PlatformId, PlatformPublishState>;
    const publishableNow: PlatformId[] = [];

    PLATFORM_ORDER.forEach((pid) => {
      const cfg = payload.configs[pid];
      const conn = platforms[pid];
      const captionUsed =
        cfg.overrideCaption && cfg.customCaption.trim()
          ? cfg.customCaption.trim()
          : payload.sharedCaption;

      if (!cfg.enabled) {
        platformStates[pid] = {
          platformId: pid,
          enabled: false,
          status: 'draft',
          progressPct: 0,
          captionUsed: '',
          channelUrlUsed: conn.channelUrl,
          updatedAt: nowIso,
        };
        return;
      }

      if (payload.publishMode === 'draft') {
        platformStates[pid] = {
          platformId: pid,
          enabled: true,
          status: 'draft',
          progressPct: 0,
          captionUsed,
          platformTitle: pid === 'youtube' ? cfg.youtubeTitle || payload.title : undefined,
          channelUrlUsed: conn.channelUrl,
          updatedAt: nowIso,
        };
        return;
      }

      if (!conn.connected || conn.apiMode === 'unconfigured') {
        platformStates[pid] = {
          platformId: pid,
          enabled: true,
          status: 'needs_api_setup',
          progressPct: 0,
          captionUsed,
          platformTitle: pid === 'youtube' ? cfg.youtubeTitle || payload.title : undefined,
          channelUrlUsed: conn.channelUrl,
          errorMessage: `${conn.name} is currently inactive for this workspace.`,
          updatedAt: nowIso,
        };
        return;
      }

      platformStates[pid] = {
        platformId: pid,
        enabled: true,
        status: 'queued',
        progressPct: 0,
        captionUsed,
        platformTitle: pid === 'youtube' ? cfg.youtubeTitle || payload.title : undefined,
        channelUrlUsed: conn.channelUrl,
        updatedAt: nowIso,
      };
      if (payload.publishMode === 'now') {
        publishableNow.push(pid);
      }
    });

    const newItem: ReelItem = {
      id: reelId,
      title: payload.title,
      sharedCaption: payload.sharedCaption,
      coverTimestampSec: payload.coverTimestampSec,
      thumbnailUrl: payload.thumbnailUrl,
      videoObjectUrl: payload.videoObjectUrl,
      metadata: payload.metadata,
      publishMode: payload.publishMode,
      scheduledFor: payload.scheduledFor,
      createdAt: nowIso,
      authorName: activeUser.name,
      authorRole: currentRole,
      platforms: platformStates,
    };

    setReels((prev) => {
      const exists = prev.some((r) => r.id === reelId);
      if (exists) {
        return prev.map((r) => (r.id === reelId ? newItem : r));
      }
      return [newItem, ...prev];
    });

    setEditingReel(null);
    setActiveView('queue');

    if (payload.publishMode === 'now') {
      notify(
        'info',
        'Reel added to publishing queue',
        publishableNow.length > 0
          ? `Uploading to ${publishableNow.length} connected channel(s)...`
          : 'Some selected channels are inactive.'
      );
      runSimulatedPublish(reelId, publishableNow, platforms);
    } else if (payload.publishMode === 'schedule') {
      notify(
        'success',
        'Reel scheduled',
        `Queued for ${payload.scheduledFor?.replace('T', ' ')}`
      );
    } else {
      notify('success', 'Draft saved', `"${payload.title}" saved to queue.`);
    }
  };

  const handleRetryPlatform = (reelId: string, platformId: PlatformId) => {
    const conn = platforms[platformId];
    if (!conn.connected || conn.apiMode === 'unconfigured') {
      if (isOwnerAdmin) {
        setIsAccountsOpen(true);
      }
      notify(
        'warning',
        `${conn.name} setup required`,
        isOwnerAdmin
          ? 'Connect Sandbox Mode or Live OAuth in the drawer, then click Retry.'
          : 'This channel is currently inactive and must be enabled by the workspace Admin.'
      );
      return;
    }

    setReels((prev) =>
      prev.map((item) =>
        item.id !== reelId
          ? item
          : {
              ...item,
              platforms: {
                ...item.platforms,
                [platformId]: {
                  ...item.platforms[platformId],
                  status: 'queued',
                  progressPct: 0,
                  channelUrlUsed: conn.channelUrl,
                  errorMessage: undefined,
                  updatedAt: new Date().toISOString(),
                },
              },
            }
      )
    );

    notify('info', `Retrying ${conn.name}`, 'Re-queued for delivery.');
    runSimulatedPublish(reelId, [platformId], platforms);
  };

  const handleDeleteReel = (reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
    notify('info', 'Reel removed from queue');
  };

  const handleEditReel = (reel: ReelItem) => {
    setEditingReel(reel);
    setActiveView('composer');
  };

  const handleNewReel = () => {
    setEditingReel(null);
    setDraftTriggerKey((k) => k + 1);
    setActiveView('composer');
  };

  // Owner-Admin-Only configuration mutations
  const handleUpdatePlatform = (
    platformId: PlatformId,
    patch: Partial<PlatformConnection>
  ) => {
    if (!isOwnerAdmin) return;
    const nextPlatforms = {
      ...platforms,
      [platformId]: {
        ...platforms[platformId],
        ...patch,
      },
    };
    setPlatforms(nextPlatforms);
    void persistPublicSettings(nextPlatforms, mediaChannels, whatsAppConfig, gmailConfig);
    if ('clientId' in patch || 'webhookEndpoint' in patch) {
      void persistPrivateCredentials(nextPlatforms);
    }
  };

  const handleUpdatePlatformChannelUrl = (
    platformId: PlatformId,
    channelUrl: string,
    handle: string
  ) => {
    if (!isOwnerAdmin) return;
    const nextPlatforms = {
      ...platforms,
      [platformId]: {
        ...platforms[platformId],
        channelUrl,
        handle,
      },
    };
    setPlatforms(nextPlatforms);
    void persistPublicSettings(nextPlatforms, mediaChannels, whatsAppConfig, gmailConfig);
  };

  const handleAddMediaChannel = (
    entry: Omit<MediaChannelEntry, 'id' | 'updatedAt'>
  ) => {
    if (!isOwnerAdmin) return;
    const next: MediaChannelEntry = {
      ...entry,
      id: `ch-${Date.now().toString(36)}`,
      updatedAt: new Date().toISOString(),
    };
    const nextChannels = [...mediaChannels, next];
    setMediaChannels(nextChannels);
    void persistPublicSettings(platforms, nextChannels, whatsAppConfig, gmailConfig);
    notify('success', 'Channel URL added', `${next.label} (${next.url})`);
  };

  const handleUpdateMediaChannel = (
    channelId: string,
    patch: Partial<MediaChannelEntry>
  ) => {
    if (!isOwnerAdmin) return;
    const target = mediaChannels.find((c) => c.id === channelId);
    const nextChannels = mediaChannels.map((c) => {
      if (c.id === channelId) {
        return { ...c, ...patch, updatedAt: new Date().toISOString() };
      }
      if (patch.isPrimary && target && c.platformId === target.platformId) {
        return { ...c, isPrimary: false };
      }
      return c;
    });
    setMediaChannels(nextChannels);
    void persistPublicSettings(platforms, nextChannels, whatsAppConfig, gmailConfig);
  };

  const handleDeleteMediaChannel = (channelId: string) => {
    if (!isOwnerAdmin) return;
    const nextChannels = mediaChannels.filter((c) => c.id !== channelId);
    setMediaChannels(nextChannels);
    void persistPublicSettings(platforms, nextChannels, whatsAppConfig, gmailConfig);
    notify('info', 'Channel URL removed');
  };

  const handleUpdateMemberRole = (memberId: string, role: UserRole) => {
    if (!isOwnerAdmin) return;
    const target = teamMembers.find((m) => m.id === memberId);
    if (!target) return;
    const updated = { ...target, role };
    setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    if (memberId === currentUserId) {
      setRoleOverride(null);
    }
    setDoc(doc(db, 'team_members', memberId), buildTeamMemberPayload(updated)).catch(
      (err) => handleFirestoreError(err, OperationType.UPDATE, `team_members/${memberId}`)
    );
    notify('success', 'User role updated', `Assigned role: ${role}`);
  };

  const handleAddTeamMember = (member: {
    name: string;
    email: string;
    role: UserRole;
  }) => {
    if (!isOwnerAdmin) return;
    const newMember: TeamMember = {
      id: `usr-${Date.now().toString(36)}`,
      name: member.name,
      email: member.email,
      role: member.role,
      status: 'invited',
      lastActiveAt: 'Invited',
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setDoc(
      doc(db, 'team_members', newMember.id),
      buildTeamMemberPayload(newMember)
    ).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `team_members/${newMember.id}`)
    );
    notify('success', 'Team member added', `${member.name} (${member.role})`);
  };

  const handleRemoveTeamMember = (memberId: string) => {
    if (!isOwnerAdmin) return;
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    deleteDoc(doc(db, 'team_members', memberId)).catch((err) =>
      handleFirestoreError(err, OperationType.DELETE, `team_members/${memberId}`)
    );
    notify('info', 'Team member removed');
  };

  const handleUpdateWhatsAppConfig = (nextWa: WhatsAppConfig) => {
    if (!isOwnerAdmin) return;
    setWhatsAppConfig(nextWa);
    void persistPublicSettings(platforms, mediaChannels, nextWa, gmailConfig);
  };

  const handleUpdateGmailConfig = (nextGmail: GmailSupportConfig) => {
    if (!isOwnerAdmin) return;
    setGmailConfig(nextGmail);
    void persistPublicSettings(platforms, mediaChannels, whatsAppConfig, nextGmail);
  };

  const attentionOrActiveCount = useMemo(() => {
    return reels.filter((r) =>
      Object.values(r.platforms).some(
        (s) =>
          s.enabled &&
          (s.status === 'queued' ||
            s.status === 'uploading' ||
            s.status === 'needs_api_setup' ||
            s.status === 'failed')
      )
    ).length;
  }, [reels]);

  const handleNavigateView = useCallback(
    (view: ActiveWorkspaceView, adminSec?: AdminSectionTab) => {
      if (view === 'admin' && !isOwnerAdmin) {
        setActiveView('dashboard');
        return;
      }
      setActiveView(view);
      if (adminSec) {
        setActiveAdminSection(adminSec);
      }
    },
    [isOwnerAdmin]
  );

  const viewBreadcrumbLabel =
    effectiveView === 'dashboard'
      ? t.navDashboard
      : effectiveView === 'composer'
      ? t.navComposer
      : effectiveView === 'queue'
      ? t.navQueue
      : activeAdminSection === 'channels'
      ? `${t.adminOptions} / ${t.navAdminChannels}`
      : activeAdminSection === 'roles'
      ? `${t.adminOptions} / ${t.navAdminRoles}`
      : `${t.adminOptions} / ${t.navAdminSupport}`;

  return (
    <MotionConfig reducedMotion="user">
      {!authReady || (authUser && authUser.emailVerified && profileLoading) ? (
        <div className="min-h-screen bg-[#EAF2FF] dark:bg-[#040B1A] text-blue-950 dark:text-blue-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-600/30 dark:bg-blue-500/15 dark:border-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-400"
            >
              <Clapperboard className="w-6 h-6" />
            </motion.div>
            <p className="font-display text-sm font-semibold">ReelSync</p>
          </motion.div>
        </div>
      ) : !authUser || !authUser.emailVerified ? (
        <>
          <AuthGate
            mode="sign-in"
            authUser={null}
            isAuthBusy={isAuthBusy}
            isSavingProfile={isSavingProfile}
            language={language}
            theme={theme}
            t={t}
            onChangeLanguage={handleChangeLanguage}
            onChangeTheme={setTheme}
            onSignInWithEmail={() => void handleSignInWithEmail()}
            onCompleteAccount={handleCompleteAccount}
            onSwitchAccount={() => void handleSignOut()}
          />
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
      ) : !userProfile || !userProfile.onboardingComplete ? (
        <>
          <AuthGate
            mode="onboarding"
            authUser={authUser}
            isAuthBusy={isAuthBusy}
            isSavingProfile={isSavingProfile}
            language={language}
            theme={theme}
            t={t}
            onChangeLanguage={handleChangeLanguage}
            onChangeTheme={setTheme}
            onSignInWithEmail={() => void handleSignInWithEmail()}
            onCompleteAccount={handleCompleteAccount}
            onSwitchAccount={() => void handleSignOut()}
          />
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
      ) : (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="relative min-h-screen bg-[#EAF2FF] dark:bg-[#040B1A] text-blue-950 dark:text-blue-50 flex"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 studio-canvas-grid opacity-55"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(59,130,246,0.18),transparent)] dark:bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(59,130,246,0.16),transparent)]"
          />
          <SidebarNav
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            activeView={effectiveView}
            activeAdminSection={activeAdminSection}
            onSelectView={handleNavigateView}
            onOpenAccountsModal={() => setIsAccountsOpen(true)}
            onNewReel={handleNewReel}
            platforms={platforms}
            isOwnerAdmin={isOwnerAdmin}
            userDisplayName={userProfile.displayName || authUser.displayName}
            userEmail={authUser.email}
            userAvatarUrl={userProfile.photoUrl || authUser.photoURL}
            onSignOut={() => void handleSignOut()}
            currentRole={currentRole}
            onChangeSessionRoleDirect={(role) => {
              if (!isOwnerAdmin) return;
              setRoleOverride(role);
              notify('info', `Previewing role: ${role}`);
            }}
            theme={theme}
            onChangeTheme={setTheme}
            language={language}
            onChangeLanguage={handleChangeLanguage}
            t={t}
            queueBadgeCount={attentionOrActiveCount}
          />

          <div className="relative z-10 flex-1 min-w-0 flex flex-col">
            {/* Contextual Top Bar */}
            <header className="sticky top-0 z-20 h-14 px-4 sm:px-6 bg-white/80 dark:bg-[#07132A]/85 backdrop-blur-xl border-b border-blue-200/80 dark:border-blue-900/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  aria-label="Open navigation menu"
                  className="lg:hidden p-2 rounded-lg text-blue-800 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-200 dark:hover:text-white dark:hover:bg-blue-900/60"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-xs text-blue-800/75 dark:text-blue-300/75 truncate">
                  <span className="text-blue-700/65 dark:text-blue-400/65 hidden sm:inline font-medium">
                    ReelSync
                  </span>
                  <span className="text-blue-300 dark:text-blue-800 hidden sm:inline">
                    /
                  </span>
                  <span className="font-semibold text-blue-950 dark:text-blue-50 truncate">
                    {viewBreadcrumbLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <LanguageSelector
                  language={language}
                  onChangeLanguage={handleChangeLanguage}
                  ariaLabel={t.languageLabel}
                  compact
                />

                <button
                  type="button"
                  onClick={() =>
                    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
                  }
                  aria-label={theme === 'dark' ? t.brightTheme : t.darkTheme}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#EAF2FF] dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 text-blue-900 dark:text-blue-100 transition-colors whitespace-nowrap"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden md:inline">{t.brightTheme}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-blue-700" />
                      <span className="hidden md:inline">{t.darkTheme}</span>
                    </>
                  )}
                </button>

                {isOwnerAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNavigateView('admin', 'roles')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EAF2FF] dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 text-blue-900 dark:text-blue-100 capitalize whitespace-nowrap"
                  >
                    <span>Role:</span>
                    <span className="text-blue-700 dark:text-blue-400 font-semibold">
                      {currentRole}
                    </span>
                  </button>
                )}

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNewReel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white dark:from-blue-500 dark:to-sky-400 dark:text-slate-950 dark:hover:from-blue-400 dark:hover:to-sky-300 shadow-xs transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.newReelShort}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  aria-label={t.signOut}
                  title={t.signOut}
                  className="lg:hidden p-1.5 rounded-lg text-blue-800 hover:text-red-600 hover:bg-blue-100 dark:text-blue-200 dark:hover:text-red-400 dark:hover:bg-blue-900/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-between gap-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={effectiveView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {effectiveView === 'dashboard' && (
                    <DashboardOverview
                      reels={reels}
                      platforms={platforms}
                      mediaChannels={mediaChannels}
                      teamMembers={teamMembers}
                      isOwnerAdmin={isOwnerAdmin}
                      currentRole={currentRole}
                      currentUserName={activeUser.name}
                      whatsAppConfig={whatsAppConfig}
                      gmailConfig={gmailConfig}
                      theme={theme}
                      onChangeTheme={setTheme}
                      onSelectView={handleNavigateView}
                      onOpenAccountsModal={() => setIsAccountsOpen(true)}
                      onNewReel={handleNewReel}
                      onPreviewReel={setPreviewReel}
                      onEditReel={handleEditReel}
                      onChangeSessionRoleDirect={(role) => {
                        if (!isOwnerAdmin) return;
                        setRoleOverride(role);
                        notify('info', `Switched active role to ${role}`);
                      }}
                      onOpenHelpBot={() => setIsHelpBotOpen(true)}
                      t={t}
                    />
                  )}

                  {effectiveView === 'composer' && (
                    <ComposerStudio
                      platforms={platforms}
                      isOwnerAdmin={isOwnerAdmin}
                      currentRole={currentRole}
                      currentUserName={activeUser.name}
                      draftTriggerKey={draftTriggerKey}
                      editingReel={editingReel}
                      onCancelEdit={() => {
                        setEditingReel(null);
                        setActiveView('queue');
                      }}
                      onOpenAccountsModal={() => setIsAccountsOpen(true)}
                      onGoToAdmin={() => handleNavigateView('admin', 'roles')}
                      onSubmitReel={handleSubmitReel}
                      onNotify={notify}
                    />
                  )}

                  {effectiveView === 'queue' && (
                    <PublishingQueue
                      reels={reels}
                      platforms={platforms}
                      isOwnerAdmin={isOwnerAdmin}
                      currentRole={currentRole}
                      onRetryPlatform={handleRetryPlatform}
                      onDeleteReel={handleDeleteReel}
                      onEditReel={handleEditReel}
                      onPreviewReel={setPreviewReel}
                      onOpenAccountsModal={() => setIsAccountsOpen(true)}
                      onNewReel={handleNewReel}
                    />
                  )}

                  {effectiveView === 'admin' && isOwnerAdmin && (
                    <AdminPanel
                      platforms={platforms}
                      mediaChannels={mediaChannels}
                      teamMembers={teamMembers}
                      currentRole={currentRole}
                      currentUserId={activeUser.id}
                      onChangeActiveSessionUser={(id) => {
                        setCurrentUserId(id);
                        setRoleOverride(null);
                        const target = teamMembers.find((m) => m.id === id);
                        if (target) {
                          notify(
                            'info',
                            `Switched session to ${target.name}`,
                            `Active role: ${target.role}`
                          );
                        }
                      }}
                      onChangeSessionRoleDirect={(role) => {
                        setRoleOverride(role);
                        notify('info', `Previewing workspace as ${role}`);
                      }}
                      onUpdatePlatformChannelUrl={handleUpdatePlatformChannelUrl}
                      onAddMediaChannel={handleAddMediaChannel}
                      onUpdateMediaChannel={handleUpdateMediaChannel}
                      onDeleteMediaChannel={handleDeleteMediaChannel}
                      onUpdateMemberRole={handleUpdateMemberRole}
                      onAddTeamMember={handleAddTeamMember}
                      onRemoveTeamMember={handleRemoveTeamMember}
                      whatsAppConfig={whatsAppConfig}
                      onUpdateWhatsAppConfig={handleUpdateWhatsAppConfig}
                      gmailConfig={gmailConfig}
                      onUpdateGmailConfig={handleUpdateGmailConfig}
                      activeSection={activeAdminSection}
                      onSelectSection={setActiveAdminSection}
                      onNotify={notify}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* End-of-Workspace Help Chatbot Section */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.12 }}
                aria-label={t.botTitle}
                className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
                />
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/12 border border-blue-500/25 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-sm sm:text-base font-semibold text-blue-950 dark:text-blue-50">
                      {t.dashAskBotTitle}
                    </h2>
                    <p className="text-xs text-blue-800/75 dark:text-blue-200/75 mt-0.5 leading-relaxed">
                      {t.dashAskBotSubtitle}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsHelpBotOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white dark:from-blue-500 dark:to-sky-400 dark:hover:from-blue-400 dark:hover:to-sky-300 dark:text-slate-950 shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  <Bot className="w-4 h-4 shrink-0" />
                  <span>{t.dashAskBotCta}</span>
                </motion.button>
              </motion.section>
            </main>
          </div>

          <ConnectedAccountsModal
            isOpen={isAccountsOpen}
            onClose={() => setIsAccountsOpen(false)}
            platforms={platforms}
            isOwnerAdmin={isOwnerAdmin}
            currentRole={currentRole}
            onUpdatePlatform={handleUpdatePlatform}
            onNotify={notify}
          />

          <ReelPreviewModal
            reel={previewReel}
            platforms={platforms}
            onClose={() => setPreviewReel(null)}
          />

          <SupportWidgets
            whatsAppConfig={whatsAppConfig}
            gmailConfig={gmailConfig}
            isOwnerAdmin={isOwnerAdmin}
            currentRole={currentRole}
            onOpenAdminSettings={() => handleNavigateView('admin', 'support')}
            isHelpBotOpen={isHelpBotOpen}
            onToggleHelpBot={() => setIsHelpBotOpen((prev) => !prev)}
            onCloseHelpBot={() => setIsHelpBotOpen(false)}
            language={language}
            currentView={effectiveView}
            t={t}
          />

          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
      )}
    </MotionConfig>
  );
}
