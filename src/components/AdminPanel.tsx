import React, { useEffect, useState } from 'react';
import {
  Check,
  ExternalLink,
  Globe,
  Link2,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { PLATFORM_ORDER, ROLE_PERMISSIONS } from '../data/initialState';
import {
  AdminSectionTab,
  MediaChannelEntry,
  PlatformConnection,
  PlatformId,
  TeamMember,
  UserRole,
  WhatsAppConfig,
  GmailSupportConfig,
} from '../types/reelsync';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';
import { WhatsAppIcon } from './WhatsAppChatWidget';
import { GmailEnvelopeMark } from './SupportWidgets';

interface AdminPanelProps {
  platforms: Record<PlatformId, PlatformConnection>;
  mediaChannels: MediaChannelEntry[];
  teamMembers: TeamMember[];
  currentRole: UserRole;
  currentUserId: string;
  onChangeActiveSessionUser: (memberId: string) => void;
  onChangeSessionRoleDirect: (role: UserRole) => void;
  onUpdatePlatformChannelUrl: (
    platformId: PlatformId,
    channelUrl: string,
    handle: string
  ) => void;
  onAddMediaChannel: (entry: Omit<MediaChannelEntry, 'id' | 'updatedAt'>) => void;
  onUpdateMediaChannel: (
    channelId: string,
    patch: Partial<MediaChannelEntry>
  ) => void;
  onDeleteMediaChannel: (channelId: string) => void;
  onUpdateMemberRole: (memberId: string, role: UserRole) => void;
  onAddTeamMember: (member: { name: string; email: string; role: UserRole }) => void;
  onRemoveTeamMember: (memberId: string) => void;
  whatsAppConfig: WhatsAppConfig;
  onUpdateWhatsAppConfig: (config: WhatsAppConfig) => void;
  gmailConfig: GmailSupportConfig;
  onUpdateGmailConfig: (config: GmailSupportConfig) => void;
  activeSection: AdminSectionTab;
  onSelectSection: (section: AdminSectionTab) => void;
  onNotify: (
    variant: 'success' | 'info' | 'warning' | 'error',
    title: string,
    description?: string
  ) => void;
}

const ROLE_ORDER: UserRole[] = ['admin', 'creator', 'editor', 'viewer'];

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  platforms,
  mediaChannels,
  teamMembers,
  currentRole,
  currentUserId,
  onChangeActiveSessionUser,
  onChangeSessionRoleDirect,
  onUpdatePlatformChannelUrl,
  onAddMediaChannel,
  onUpdateMediaChannel,
  onDeleteMediaChannel,
  onUpdateMemberRole,
  onAddTeamMember,
  onRemoveTeamMember,
  whatsAppConfig,
  onUpdateWhatsAppConfig,
  gmailConfig,
  onUpdateGmailConfig,
  activeSection,
  onSelectSection,
  onNotify,
}) => {
  const canAdmin = ROLE_PERMISSIONS[currentRole].canManageAdminAndUrls;

  const [waDraft, setWaDraft] = useState<WhatsAppConfig>(whatsAppConfig);
  const [gmailDraft, setGmailDraft] = useState<GmailSupportConfig>(gmailConfig);

  // Local editable drafts for primary platform URLs
  const [platformUrlDrafts, setPlatformUrlDrafts] = useState<
    Record<PlatformId, { url: string; handle: string }>
  >(() => ({
    tiktok: { url: platforms.tiktok.channelUrl, handle: platforms.tiktok.handle },
    instagram: {
      url: platforms.instagram.channelUrl,
      handle: platforms.instagram.handle,
    },
    youtube: { url: platforms.youtube.channelUrl, handle: platforms.youtube.handle },
    snapchat: {
      url: platforms.snapchat.channelUrl,
      handle: platforms.snapchat.handle,
    },
  }));

  // Add custom media channel form
  const [newChannelPlatform, setNewChannelPlatform] = useState<PlatformId>('youtube');
  const [newChannelLabel, setNewChannelLabel] = useState('');
  const [newChannelHandle, setNewChannelHandle] = useState('');
  const [newChannelUrl, setNewChannelUrl] = useState('');

  useEffect(() => {
    setWaDraft(whatsAppConfig);
  }, [whatsAppConfig]);

  useEffect(() => {
    setGmailDraft(gmailConfig);
  }, [gmailConfig]);

  useEffect(() => {
    setPlatformUrlDrafts({
      tiktok: { url: platforms.tiktok.channelUrl, handle: platforms.tiktok.handle },
      instagram: {
        url: platforms.instagram.channelUrl,
        handle: platforms.instagram.handle,
      },
      youtube: { url: platforms.youtube.channelUrl, handle: platforms.youtube.handle },
      snapchat: {
        url: platforms.snapchat.channelUrl,
        handle: platforms.snapchat.handle,
      },
    });
  }, [platforms]);

  // Add team member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('creator');

  const handleSavePrimaryUrl = (pid: PlatformId) => {
    if (!canAdmin) {
      onNotify(
        'warning',
        'Admin role required',
        'Switch the active session role to Admin above to edit media channel URLs.'
      );
      return;
    }

    const draft = platformUrlDrafts[pid];
    if (!isValidHttpUrl(draft.url)) {
      onNotify(
        'error',
        'Invalid channel URL',
        'Please enter a valid https:// URL for this media channel.'
      );
      return;
    }

    onUpdatePlatformChannelUrl(pid, draft.url.trim(), draft.handle.trim() || '@channel');

    // Sync matching primary entry in mediaChannels if present
    const matchingPrimary = mediaChannels.find(
      (c) => c.platformId === pid && c.isPrimary
    );
    if (matchingPrimary) {
      onUpdateMediaChannel(matchingPrimary.id, {
        url: draft.url.trim(),
        handle: draft.handle.trim() || matchingPrimary.handle,
      });
    }

    onNotify(
      'success',
      `${platforms[pid].name} channel URL updated`,
      draft.url.trim()
    );
  };

  const handleCreateMediaChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdmin) {
      onNotify('warning', 'Admin role required', 'Only Admins can register channel URLs.');
      return;
    }
    if (!newChannelLabel.trim() || !isValidHttpUrl(newChannelUrl)) {
      onNotify(
        'error',
        'Incomplete channel details',
        'Provide a channel label and a valid https:// media channel URL.'
      );
      return;
    }

    onAddMediaChannel({
      platformId: newChannelPlatform,
      label: newChannelLabel.trim(),
      handle: newChannelHandle.trim() || '@channel',
      url: newChannelUrl.trim(),
      isPrimary: false,
      addedByRole: currentRole,
    });

    setNewChannelLabel('');
    setNewChannelHandle('');
    setNewChannelUrl('');
  };

  const handleCreateTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdmin) {
      onNotify('warning', 'Admin role required', 'Only Admins can invite or assign team roles.');
      return;
    }
    if (!newMemberName.trim() || !newMemberEmail.includes('@')) {
      onNotify(
        'error',
        'Invalid member details',
        'Enter a full name and a valid email address.'
      );
      return;
    }

    onAddTeamMember({
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
    });

    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('creator');
  };

  return (
    <div className="space-y-8">
      {/* Admin Header & Active Role Tester */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-blue-200/80 dark:border-blue-900/70">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-50 text-balance">
            Admin Panel — Media Channels & User Roles
          </h1>
          <p className="text-sm text-blue-800/80 dark:text-blue-200/75 mt-0.5">
            Configure destination URLs for every social media channel and manage workspace role permissions.
          </p>
        </div>

        {/* Interactive Session Role Switcher for Testing RBAC */}
        <div className="flex flex-wrap items-center gap-3 bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-blue-800/80 dark:text-blue-300/75">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Preview as Role:</span>
          </div>
          <div className="inline-flex items-center gap-1 p-0.5 bg-[#EAF2FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-900/80 rounded-xl">
            {ROLE_ORDER.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onChangeSessionRoleDirect(role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  currentRole === role
                    ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950'
                    : 'text-blue-800/80 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl shadow-xs">
        {(
          [
            { id: 'channels', label: 'Media Channel URLs' },
            { id: 'roles', label: 'User Roles & Team' },
            { id: 'support', label: 'WhatsApp & Gmail Support' },
          ] as { id: AdminSectionTab; label: string }[]
        ).map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950 shadow-xs'
                  : 'text-blue-800/80 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Media Channel URLs */}
      {activeSection === 'channels' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-display text-base font-semibold text-blue-950 dark:text-blue-50">
                Media Channel URLs
              </h2>
            </div>
            <span className="text-xs text-blue-700/75 dark:text-blue-400/70">
              Primary URLs auto-link in Composer and Publishing Queue
            </span>
          </div>

          {/* Primary Channel URL Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORM_ORDER.map((pid) => {
              const conn = platforms[pid];
              const draft = platformUrlDrafts[pid];
              const urlValid = isValidHttpUrl(draft.url);

              return (
                <div
                  key={pid}
                  className="bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 rounded-xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={getPlatformAccentText(pid)}>
                        <PlatformIcon platformId={pid} className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-semibold text-blue-950 dark:text-blue-50">
                        {conn.name}
                      </span>
                    </div>
                    <a
                      href={conn.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200 transition-colors whitespace-nowrap"
                    >
                      <span>Open Channel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                        Handle
                      </label>
                      <input
                        type="text"
                        disabled={!canAdmin}
                        value={draft.handle}
                        onChange={(e) =>
                          setPlatformUrlDrafts((prev) => ({
                            ...prev,
                            [pid]: { ...prev[pid], handle: e.target.value },
                          }))
                        }
                        className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs font-mono text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                        Channel URL
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          disabled={!canAdmin}
                          value={draft.url}
                          onChange={(e) =>
                            setPlatformUrlDrafts((prev) => ({
                              ...prev,
                              [pid]: { ...prev[pid], url: e.target.value },
                            }))
                          }
                          placeholder={`https://www.${pid}.com/@channel`}
                          className={`w-full bg-[#F2F7FF] dark:bg-[#051024] border rounded-lg px-2.5 py-1.5 text-xs font-mono text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50 ${
                            urlValid
                              ? 'border-blue-200 dark:border-blue-800/80 focus:border-blue-500'
                              : 'border-red-500/70'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={!canAdmin}
                          onClick={() => handleSavePrimaryUrl(pid)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional / Multi-Channel URL Directory */}
          <div className="bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-semibold text-blue-950 dark:text-blue-50">
                  Channel URL Directory ({mediaChannels.length})
                </h3>
                <p className="text-xs text-blue-800/80 dark:text-blue-200/75 mt-0.5">
                  Register secondary brand channels, regional accounts, or clip pages and assign any URL as primary.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-200 dark:border-blue-900/70 text-[11px] font-medium text-blue-700/75 dark:text-blue-400/70">
                    <th className="py-2.5 pr-4">Platform</th>
                    <th className="py-2.5 pr-4">Channel Label</th>
                    <th className="py-2.5 pr-4">Handle</th>
                    <th className="py-2.5 pr-4">Media Channel URL</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200/80 dark:divide-blue-900/70 text-xs">
                  {mediaChannels.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-blue-50/70 dark:hover:bg-blue-950/35"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-blue-950 dark:text-blue-100">
                          <span className={getPlatformAccentText(entry.platformId)}>
                            <PlatformIcon
                              platformId={entry.platformId}
                              className="w-3.5 h-3.5"
                            />
                          </span>
                          <span>{platforms[entry.platformId].shortName}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-blue-950 dark:text-blue-100 font-medium">
                        <span>{entry.label}</span>
                        {entry.isPrimary && (
                          <span className="ml-2 text-[11px] font-normal text-blue-600 dark:text-blue-400">
                            · Primary
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-mono text-blue-800/80 dark:text-blue-300/75">
                        {entry.handle}
                      </td>
                      <td className="py-3 pr-4 max-w-xs">
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-blue-900 hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-400 truncate max-w-full"
                        >
                          <Link2 className="w-3 h-3 shrink-0 text-blue-600/70 dark:text-blue-400/70" />
                          <span className="truncate">{entry.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap space-x-2">
                        {!entry.isPrimary && canAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdatePlatformChannelUrl(
                                entry.platformId,
                                entry.url,
                                entry.handle
                              );
                              setPlatformUrlDrafts((prev) => ({
                                ...prev,
                                [entry.platformId]: {
                                  url: entry.url,
                                  handle: entry.handle,
                                },
                              }));
                              onUpdateMediaChannel(entry.id, { isPrimary: true });
                              onNotify(
                                'success',
                                'Primary channel switched',
                                `${entry.label} is now the active ${platforms[entry.platformId].shortName} target.`
                              );
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            Set Primary
                          </button>
                        )}
                        {!entry.isPrimary && canAdmin && (
                          <button
                            type="button"
                            onClick={() => onDeleteMediaChannel(entry.id)}
                            aria-label={`Delete ${entry.label}`}
                            className="text-blue-700/70 hover:text-red-600 dark:text-blue-400/70 dark:hover:text-red-400 transition-colors align-middle"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Channel URL Form */}
            <form
              onSubmit={handleCreateMediaChannel}
              className="pt-3 border-t border-blue-200/80 dark:border-blue-900/70 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                  Platform
                </label>
                <select
                  disabled={!canAdmin}
                  value={newChannelPlatform}
                  onChange={(e) =>
                    setNewChannelPlatform(e.target.value as PlatformId)
                  }
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 rounded-lg px-2.5 py-2 text-xs text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                >
                  {PLATFORM_ORDER.map((pid) => (
                    <option key={pid} value={pid}>
                      {platforms[pid].shortName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                  Channel Label
                </label>
                <input
                  type="text"
                  disabled={!canAdmin}
                  value={newChannelLabel}
                  onChange={(e) => setNewChannelLabel(e.target.value)}
                  placeholder="e.g., Podcast Clips"
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                  Handle
                </label>
                <input
                  type="text"
                  disabled={!canAdmin}
                  value={newChannelHandle}
                  onChange={(e) => setNewChannelHandle(e.target.value)}
                  placeholder="@clips"
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                  Channel URL
                </label>
                <input
                  type="url"
                  disabled={!canAdmin}
                  value={newChannelUrl}
                  onChange={(e) => setNewChannelUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@clips"
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!canAdmin}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Channel URL</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* SECTION 2: User Roles & Team Access */}
      {activeSection === 'roles' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="font-display text-base font-semibold text-blue-950 dark:text-blue-50">
                User Roles & Team Access
              </h2>
            </div>
            <span className="text-xs text-blue-700/75 dark:text-blue-400/70">
              Role-based access control enforced across Composer, Queue & Admin
            </span>
          </div>

          {/* Role Permissions Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROLE_ORDER.map((roleKey) => {
              const spec = ROLE_PERMISSIONS[roleKey];
              const isCurrent = currentRole === roleKey;
              return (
                <div
                  key={roleKey}
                  className={`rounded-xl p-4 border space-y-2.5 transition-colors ${
                    isCurrent
                      ? 'bg-white dark:bg-[#0F264D] border-blue-500 shadow-xs'
                      : 'bg-white/90 dark:bg-[#0A1A38]/85 border-blue-200 dark:border-blue-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-blue-950 dark:text-blue-50">
                      {spec.label}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-800/80 dark:text-blue-200/75 leading-relaxed">
                    {spec.summary}
                  </p>
                  <ul className="pt-1 space-y-1 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <Check
                        className={`w-3 h-3 ${
                          spec.canUploadAndCompose
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-blue-300 dark:text-blue-800'
                        }`}
                      />
                      <span
                        className={
                          spec.canUploadAndCompose
                            ? 'text-blue-950 dark:text-blue-100'
                            : 'text-blue-700/45 dark:text-blue-500/45'
                        }
                      >
                        Upload & Compose Reels
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check
                        className={`w-3 h-3 ${
                          spec.canPublishImmediately
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-blue-300 dark:text-blue-800'
                        }`}
                      />
                      <span
                        className={
                          spec.canPublishImmediately
                            ? 'text-blue-950 dark:text-blue-100'
                            : 'text-blue-700/45 dark:text-blue-500/45'
                        }
                      >
                        Publish Immediately
                      </span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check
                        className={`w-3 h-3 ${
                          spec.canManageAdminAndUrls
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-blue-300 dark:text-blue-800'
                        }`}
                      />
                      <span
                        className={
                          spec.canManageAdminAndUrls
                            ? 'text-blue-950 dark:text-blue-100'
                            : 'text-blue-700/45 dark:text-blue-500/45'
                        }
                      >
                        Manage Channel URLs & Roles
                      </span>
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Team Members Table */}
          <div className="bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-blue-200 dark:border-blue-900/70 text-[11px] font-medium text-blue-700/75 dark:text-blue-400/70">
                    <th className="py-2.5 pr-4">Team Member</th>
                    <th className="py-2.5 pr-4">Email</th>
                    <th className="py-2.5 pr-4">Assigned Role</th>
                    <th className="py-2.5 pr-4">Activity</th>
                    <th className="py-2.5 text-right">Session / Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200/80 dark:divide-blue-900/70 text-xs">
                  {teamMembers.map((member) => {
                    const isActiveSession = member.id === currentUserId;
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-blue-50/70 dark:hover:bg-blue-950/35"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover border border-blue-300 dark:border-blue-700 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/70 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-[11px] font-semibold text-blue-900 dark:text-blue-100 shrink-0">
                                {member.name
                                  .split(' ')
                                  .map((p) => p[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-blue-950 dark:text-blue-50">
                                {member.name}
                              </span>
                              {isActiveSession && (
                                <span className="ml-1.5 text-[11px] text-blue-600 dark:text-blue-400">
                                  (You)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 font-mono text-blue-800/80 dark:text-blue-300/75">
                          {member.email}
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            disabled={!canAdmin}
                            value={member.role}
                            onChange={(e) =>
                              onUpdateMemberRole(member.id, e.target.value as UserRole)
                            }
                            aria-label={`Role for ${member.name}`}
                            className="bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 rounded-lg px-2.5 py-1 text-xs text-blue-950 dark:text-blue-50 capitalize focus:outline-none disabled:opacity-50"
                          >
                            {ROLE_ORDER.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-4 text-blue-800/80 dark:text-blue-300/75">
                          <span>{member.lastActiveAt}</span>
                          <span className="mx-1.5 text-blue-500/60" aria-hidden="true">
                            ·
                          </span>
                          <span className="capitalize">{member.status}</span>
                        </td>
                        <td className="py-3 text-right whitespace-nowrap space-x-3">
                          <button
                            type="button"
                            onClick={() => onChangeActiveSessionUser(member.id)}
                            className={`text-xs font-medium ${
                              isActiveSession
                                ? 'text-blue-700 dark:text-blue-400'
                                : 'text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200'
                            }`}
                          >
                            {isActiveSession ? 'Active User' : 'Impersonate'}
                          </button>
                          {canAdmin && teamMembers.length > 1 && !isActiveSession && (
                            <button
                              type="button"
                              onClick={() => onRemoveTeamMember(member.id)}
                              aria-label={`Remove ${member.name}`}
                              className="text-blue-700/70 hover:text-red-600 dark:text-blue-400/70 dark:hover:text-red-400 transition-colors align-middle"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Team Member Form */}
            <form
              onSubmit={handleCreateTeamMember}
              className="pt-3 border-t border-blue-200/80 dark:border-blue-900/70 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
            >
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!canAdmin}
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g., Jordan Vance"
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  disabled={!canAdmin}
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="jordan@reelsync.studio"
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                  User Role
                </label>
                <select
                  disabled={!canAdmin}
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 rounded-lg px-2.5 py-2 text-xs text-blue-950 dark:text-blue-50 capitalize focus:outline-none disabled:opacity-50"
                >
                  {ROLE_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!canAdmin}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* SECTION 3: WhatsApp Chat Widget Settings */}
      {activeSection === 'support' && (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[#25D366]">
                  <WhatsAppIcon className="w-4 h-4" />
                </span>
                <h2 className="font-display text-base font-semibold text-blue-950 dark:text-blue-50">
                  WhatsApp Chat Widget
                </h2>
              </div>
              <span className="text-xs text-blue-700/75 dark:text-blue-400/70">
                Configure the floating WhatsApp chat button shown across the site
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canAdmin) {
                  onNotify(
                    'warning',
                    'Admin role required',
                    'Switch to Admin role to update WhatsApp chat settings.'
                  );
                  return;
                }
                onUpdateWhatsAppConfig(waDraft);
                onNotify(
                  'success',
                  'WhatsApp chat settings saved',
                  waDraft.enabled
                    ? `Active for ${waDraft.phoneNumber || 'WhatsApp Web'}`
                    : 'Floating WhatsApp icon hidden'
                );
              }}
              className="bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 rounded-xl p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-950 dark:text-blue-50">
                    Show Floating WhatsApp Chat Icon
                  </p>
                  <p className="text-xs text-blue-800/80 dark:text-blue-200/75 mt-0.5">
                    Displays a quick-launch WhatsApp chat button in the bottom-right corner.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={waDraft.enabled}
                  disabled={!canAdmin}
                  onClick={() =>
                    setWaDraft((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 ${
                    waDraft.enabled ? 'bg-[#25D366]' : 'bg-blue-200 dark:bg-blue-900'
                  }`}
                >
                  <span className="sr-only">Toggle WhatsApp chat icon</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-150 ${
                      waDraft.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-200/80 dark:border-blue-900/70">
                <div>
                  <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    disabled={!canAdmin}
                    value={waDraft.displayName}
                    onChange={(e) =>
                      setWaDraft((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    placeholder="ReelSync Studio Support"
                    className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                    WhatsApp Number (with country code)
                  </label>
                  <input
                    type="tel"
                    disabled={!canAdmin}
                    value={waDraft.phoneNumber}
                    onChange={(e) =>
                      setWaDraft((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    placeholder="03004704984"
                    className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                    Default Greeting Message
                  </label>
                  <input
                    type="text"
                    disabled={!canAdmin}
                    value={waDraft.defaultMessage}
                    onChange={(e) =>
                      setWaDraft((prev) => ({
                        ...prev,
                        defaultMessage: e.target.value,
                      }))
                    }
                    placeholder="Hi! I have a question about ReelSync."
                    className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!canAdmin}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  Save WhatsApp Settings
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 4: Gmail Support Settings */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GmailEnvelopeMark className="w-4 h-4" />
                <h2 className="font-display text-base font-semibold text-blue-950 dark:text-blue-50">
                  Gmail Support Widget
                </h2>
              </div>
              <span className="text-xs text-blue-700/75 dark:text-blue-400/70">
                Configure the floating Gmail support button and recipient address
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canAdmin) {
                  onNotify(
                    'warning',
                    'Admin role required',
                    'Switch to Admin role to update Gmail support settings.'
                  );
                  return;
                }
                if (!gmailDraft.email.includes('@')) {
                  onNotify(
                    'error',
                    'Invalid Gmail address',
                    'Please enter a valid email address (e.g. alobli456@gmail.com).'
                  );
                  return;
                }
                onUpdateGmailConfig(gmailDraft);
                onNotify(
                  'success',
                  'Gmail support settings saved',
                  gmailDraft.enabled
                    ? `Active for ${gmailDraft.email}`
                    : 'Floating Gmail icon hidden'
                );
              }}
              className="bg-white/90 dark:bg-[#0A1A38]/85 border border-blue-200 dark:border-blue-900/70 rounded-xl p-5 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-950 dark:text-blue-50">
                    Show Floating Gmail Support Icon
                  </p>
                  <p className="text-xs text-blue-800/80 dark:text-blue-200/75 mt-0.5">
                    Lets creators and visitors compose a direct Gmail message to your support inbox.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={gmailDraft.enabled}
                  disabled={!canAdmin}
                  onClick={() =>
                    setGmailDraft((prev) => ({ ...prev, enabled: !prev.enabled }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 ${
                    gmailDraft.enabled
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-blue-200 dark:bg-blue-900'
                  }`}
                >
                  <span className="sr-only">Toggle Gmail support icon</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-150 ${
                      gmailDraft.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-blue-200/80 dark:border-blue-900/70">
                <div>
                  <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                    Support Label
                  </label>
                  <input
                    type="text"
                    disabled={!canAdmin}
                    value={gmailDraft.displayName}
                    onChange={(e) =>
                      setGmailDraft((prev) => ({ ...prev, displayName: e.target.value }))
                    }
                    placeholder="ReelSync Email Support"
                    className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    disabled={!canAdmin}
                    value={gmailDraft.email}
                    onChange={(e) =>
                      setGmailDraft((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="alobli456@gmail.com"
                    className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                    Default Subject
                  </label>
                  <input
                    type="text"
                    disabled={!canAdmin}
                    value={gmailDraft.defaultSubject}
                    onChange={(e) =>
                      setGmailDraft((prev) => ({
                        ...prev,
                        defaultSubject: e.target.value,
                      }))
                    }
                    placeholder="ReelSync Support Inquiry"
                    className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-blue-800/80 dark:text-blue-300/75 mb-1">
                    Default Message
                  </label>
                  <input
                    type="text"
                    disabled={!canAdmin}
                    value={gmailDraft.defaultMessage}
                    onChange={(e) =>
                      setGmailDraft((prev) => ({
                        ...prev,
                        defaultMessage: e.target.value,
                      }))
                    }
                    placeholder="Hi! I have a question about ReelSync."
                    className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!canAdmin}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  Save Gmail Settings
                </button>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
};
