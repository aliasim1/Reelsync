export type PlatformId = 'tiktok' | 'instagram' | 'youtube' | 'snapchat';

export type UserRole = 'admin' | 'creator' | 'editor' | 'viewer';

export type ApiMode = 'sandbox' | 'live' | 'unconfigured';

export type PublishJobStatus =
  | 'draft'
  | 'queued'
  | 'uploading'
  | 'published'
  | 'needs_api_setup'
  | 'failed';

export type QueueFilterTab = 'all' | 'scheduled' | 'published' | 'needs_attention';

export type ActiveWorkspaceView = 'dashboard' | 'composer' | 'queue' | 'admin';

export type AdminSectionTab = 'channels' | 'roles' | 'support';

export type ThemeMode = 'light' | 'dark';

export type SupportedLanguage = 'en' | 'ur' | 'roman-ur' | 'ar' | 'es' | 'fr';

export interface UserAccountProfile {
  uid: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  language: SupportedLanguage;
  role: 'creator';
  onboardingComplete: boolean;
}

export interface VideoMetadata {
  fileName: string;
  fileSizeBytes: number;
  durationSec: number;
  width: number;
  height: number;
  aspectRatioLabel: string;
  isVertical916: boolean;
  mimeType: string;
}

export interface PlatformConnection {
  id: PlatformId;
  name: string;
  shortName: string;
  connected: boolean;
  handle: string;
  channelUrl: string;
  apiMode: ApiMode;
  clientId: string;
  webhookEndpoint: string;
  maxDurationSec: number;
  maxCaptionLength: number;
  setupSteps: string[];
  lastSyncedAt?: string;
}

export interface MediaChannelEntry {
  id: string;
  platformId: PlatformId;
  label: string;
  handle: string;
  url: string;
  isPrimary: boolean;
  addedByRole: UserRole;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'active' | 'invited';
  lastActiveAt: string;
}

export interface RolePermissionSpec {
  role: UserRole;
  label: string;
  summary: string;
  canUploadAndCompose: boolean;
  canPublishImmediately: boolean;
  canSchedule: boolean;
  canRetryOrDelete: boolean;
  canManageAccounts: boolean;
  canManageAdminAndUrls: boolean;
}

export interface PlatformPublishConfig {
  enabled: boolean;
  overrideCaption: boolean;
  customCaption: string;
  // Platform-specific options
  youtubeTitle?: string;
  youtubePrivacy?: 'public' | 'unlisted' | 'private';
  tiktokPrivacy?: 'public' | 'friends' | 'private';
  tiktokAllowComments?: boolean;
  tiktokAllowDuet?: boolean;
  tiktokAllowStitch?: boolean;
  instagramShareToFeed?: boolean;
  snapchatSpotlightTopic?: string;
}

export interface PlatformPublishState {
  platformId: PlatformId;
  enabled: boolean;
  status: PublishJobStatus;
  progressPct: number;
  captionUsed: string;
  platformTitle?: string;
  channelUrlUsed: string;
  publishedUrl?: string;
  errorMessage?: string;
  updatedAt: string;
}

export interface ReelItem {
  id: string;
  title: string;
  sharedCaption: string;
  coverTimestampSec: number;
  thumbnailUrl?: string;
  videoObjectUrl?: string;
  metadata: VideoMetadata;
  publishMode: 'now' | 'schedule' | 'draft';
  scheduledFor?: string;
  createdAt: string;
  authorName: string;
  authorRole: UserRole;
  platforms: Record<PlatformId, PlatformPublishState>;
}

export interface ToastMessage {
  id: string;
  variant: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  displayName: string;
  defaultMessage: string;
}

export interface GmailSupportConfig {
  enabled: boolean;
  email: string;
  displayName: string;
  defaultSubject: string;
  defaultMessage: string;
}


