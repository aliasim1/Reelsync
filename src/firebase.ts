import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  GmailSupportConfig,
  MediaChannelEntry,
  PlatformConnection,
  PlatformId,
  SupportedLanguage,
  TeamMember,
  WhatsAppConfig,
} from './types/reelsync';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const OWNER_ADMIN_EMAIL = 'alobli456@gmail.com';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export function isVerifiedOwnerUser(user: User | null): boolean {
  if (!user || !user.emailVerified || !user.email) return false;
  return user.email.trim().toLowerCase() === OWNER_ADMIN_EMAIL;
}

export async function signInWithGoogleAccount(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export const signInWithGoogleAdmin = signInWithGoogleAccount;

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

function clampStr(val: string | undefined, max: number): string {
  return (val ?? '').trim().slice(0, max);
}

function sanitizePublicPlatform(conn: PlatformConnection) {
  return {
    id: conn.id,
    name: clampStr(conn.name, 60),
    shortName: clampStr(conn.shortName, 40),
    connected: Boolean(conn.connected),
    handle: clampStr(conn.handle, 100),
    channelUrl: clampStr(conn.channelUrl, 300),
    apiMode: conn.apiMode,
    maxDurationSec: Math.min(Math.max(1, Math.round(conn.maxDurationSec || 60)), 3600),
    maxCaptionLength: Math.min(Math.max(1, Math.round(conn.maxCaptionLength || 250)), 10000),
    lastSyncedAt: clampStr(conn.lastSyncedAt, 64),
  };
}

export function buildPublicSettingsPayload(params: {
  platforms: Record<PlatformId, PlatformConnection>;
  mediaChannels: MediaChannelEntry[];
  whatsAppConfig: WhatsAppConfig;
  gmailConfig: GmailSupportConfig;
  uid: string;
}) {
  return {
    platforms: {
      tiktok: sanitizePublicPlatform(params.platforms.tiktok),
      instagram: sanitizePublicPlatform(params.platforms.instagram),
      youtube: sanitizePublicPlatform(params.platforms.youtube),
      snapchat: sanitizePublicPlatform(params.platforms.snapchat),
    },
    mediaChannels: params.mediaChannels.slice(0, 25).map((ch) => ({
      id: clampStr(ch.id, 128),
      platformId: ch.platformId,
      label: clampStr(ch.label, 120),
      handle: clampStr(ch.handle, 100),
      url: clampStr(ch.url, 300),
      isPrimary: Boolean(ch.isPrimary),
      addedByRole: ch.addedByRole,
      updatedAt: clampStr(ch.updatedAt, 64),
    })),
    whatsAppConfig: {
      enabled: Boolean(params.whatsAppConfig.enabled),
      phoneNumber: clampStr(params.whatsAppConfig.phoneNumber, 40),
      displayName: clampStr(params.whatsAppConfig.displayName, 100),
      defaultMessage: clampStr(params.whatsAppConfig.defaultMessage, 300),
    },
    gmailConfig: {
      enabled: Boolean(params.gmailConfig.enabled),
      email: clampStr(params.gmailConfig.email, 180),
      displayName: clampStr(params.gmailConfig.displayName, 100),
      defaultSubject: clampStr(params.gmailConfig.defaultSubject, 150),
      defaultMessage: clampStr(params.gmailConfig.defaultMessage, 500),
    },
    updatedBy: clampStr(params.uid, 128),
    updatedAt: serverTimestamp(),
  };
}

export function buildPrivateCredentialsPayload(
  platforms: Record<PlatformId, PlatformConnection>,
  uid: string
) {
  return {
    tiktokClientId: clampStr(platforms.tiktok.clientId, 200),
    tiktokWebhook: clampStr(platforms.tiktok.webhookEndpoint, 400),
    instagramClientId: clampStr(platforms.instagram.clientId, 200),
    instagramWebhook: clampStr(platforms.instagram.webhookEndpoint, 400),
    youtubeClientId: clampStr(platforms.youtube.clientId, 200),
    youtubeWebhook: clampStr(platforms.youtube.webhookEndpoint, 400),
    snapchatClientId: clampStr(platforms.snapchat.clientId, 200),
    snapchatWebhook: clampStr(platforms.snapchat.webhookEndpoint, 400),
    updatedBy: clampStr(uid, 128),
    updatedAt: serverTimestamp(),
  };
}

export function buildTeamMemberPayload(member: TeamMember) {
  const payload: Record<string, unknown> = {
    id: clampStr(member.id, 128).replace(/[^a-zA-Z0-9_-]/g, ''),
    name: clampStr(member.name, 120) || 'Member',
    email: clampStr(member.email, 180) || 'user@reelsync.studio',
    role: member.role,
    status: member.status,
    lastActiveAt: clampStr(member.lastActiveAt, 64) || 'Active',
    updatedAt: serverTimestamp(),
  };
  if (member.avatarUrl) {
    payload.avatarUrl = clampStr(member.avatarUrl, 500);
  }
  return payload;
}

export function buildUserAccountCreatePayload(params: {
  uid: string;
  displayName: string;
  email: string;
  photoUrl?: string | null;
  language: SupportedLanguage;
  onboardingComplete?: boolean;
}) {
  const payload: Record<string, unknown> = {
    uid: clampStr(params.uid, 128).replace(/[^a-zA-Z0-9_-]/g, ''),
    displayName: clampStr(params.displayName, 120) || 'ReelSync Creator',
    email: clampStr(params.email, 180),
    language: params.language,
    role: 'creator',
    onboardingComplete: Boolean(params.onboardingComplete ?? true),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (params.photoUrl) {
    payload.photoUrl = clampStr(params.photoUrl, 500);
  }
  return payload;
}

export function buildUserAccountUpdatePatch(params: {
  displayName?: string;
  photoUrl?: string | null;
  language?: SupportedLanguage;
  onboardingComplete?: boolean;
}) {
  const patch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (params.displayName !== undefined) {
    patch.displayName = clampStr(params.displayName, 120) || 'ReelSync Creator';
  }
  if (params.photoUrl) {
    patch.photoUrl = clampStr(params.photoUrl, 500);
  }
  if (params.language !== undefined) {
    patch.language = params.language;
  }
  if (params.onboardingComplete !== undefined) {
    patch.onboardingComplete = Boolean(params.onboardingComplete);
  }
  return patch;
}
