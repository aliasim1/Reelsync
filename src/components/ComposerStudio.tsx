import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Film,
  Hash,
  Image as ImageIcon,
  Lock,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  DEFAULT_PLATFORM_CONFIGS,
  PLATFORM_ORDER,
  QUICK_HASHTAGS,
  ROLE_PERMISSIONS,
} from '../data/initialState';
import {
  PlatformConnection,
  PlatformId,
  PlatformPublishConfig,
  ReelItem,
  UserRole,
  VideoMetadata,
} from '../types/reelsync';
import {
  captureFrameAtTimestamp,
  formatBytes,
  formatDuration,
  generateSampleVerticalClip,
  inspectVideoFile,
} from '../utils/videoInspector';
import { PlatformIcon, getPlatformAccentText } from './PlatformIcons';

interface ComposerStudioProps {
  platforms: Record<PlatformId, PlatformConnection>;
  isOwnerAdmin: boolean;
  currentRole: UserRole;
  currentUserName: string;
  draftTriggerKey: number;
  editingReel: ReelItem | null;
  onCancelEdit: () => void;
  onOpenAccountsModal: () => void;
  onGoToAdmin: () => void;
  onSubmitReel: (payload: {
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
  }) => void;
  onNotify: (
    variant: 'success' | 'info' | 'warning' | 'error',
    title: string,
    description?: string
  ) => void;
}

function getDefaultScheduleValue(): string {
  const now = new Date();
  now.setHours(now.getHours() + 2, 0, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}`;
}

export const ComposerStudio: React.FC<ComposerStudioProps> = ({
  platforms,
  isOwnerAdmin,
  currentRole,
  currentUserName,
  draftTriggerKey,
  editingReel,
  onCancelEdit,
  onOpenAccountsModal,
  onGoToAdmin,
  onSubmitReel,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const [videoObjectUrl, setVideoObjectUrl] = useState<string | undefined>(undefined);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(undefined);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [coverTimestampSec, setCoverTimestampSec] = useState<number>(0);

  const [title, setTitle] = useState('');
  const [sharedCaption, setSharedCaption] = useState('');
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState<string>(getDefaultScheduleValue);
  const [configs, setConfigs] = useState<Record<PlatformId, PlatformPublishConfig>>(
    () => structuredClone(DEFAULT_PLATFORM_CONFIGS)
  );

  const permissions = ROLE_PERMISSIONS[currentRole];

  // Reset form when "New Reel" is pressed
  useEffect(() => {
    if (draftTriggerKey === 0) return;
    setVideoObjectUrl(undefined);
    setThumbnailUrl(undefined);
    setMetadata(null);
    setCoverTimestampSec(0);
    setTitle('');
    setSharedCaption('');
    setPublishMode('now');
    setScheduledFor(getDefaultScheduleValue());
    setConfigs(structuredClone(DEFAULT_PLATFORM_CONFIGS));
  }, [draftTriggerKey]);

  // Populate when editing a reel from Queue
  useEffect(() => {
    if (!editingReel) return;
    setVideoObjectUrl(editingReel.videoObjectUrl);
    setThumbnailUrl(editingReel.thumbnailUrl);
    setMetadata(editingReel.metadata);
    setCoverTimestampSec(editingReel.coverTimestampSec || 0);
    setTitle(editingReel.title);
    setSharedCaption(editingReel.sharedCaption);
    setPublishMode(editingReel.publishMode === 'schedule' ? 'schedule' : 'now');
    setScheduledFor(editingReel.scheduledFor || getDefaultScheduleValue());

    const nextConfigs = structuredClone(DEFAULT_PLATFORM_CONFIGS);
    PLATFORM_ORDER.forEach((pid) => {
      const state = editingReel.platforms[pid];
      if (state) {
        nextConfigs[pid].enabled = state.enabled;
        if (state.captionUsed && state.captionUsed !== editingReel.sharedCaption) {
          nextConfigs[pid].overrideCaption = true;
          nextConfigs[pid].customCaption = state.captionUsed;
        }
        if (pid === 'youtube' && state.platformTitle) {
          nextConfigs[pid].youtubeTitle = state.platformTitle;
        }
      }
    });
    setConfigs(nextConfigs);
  }, [editingReel]);

  const enabledPlatformIds = useMemo(
    () => PLATFORM_ORDER.filter((pid) => configs[pid].enabled),
    [configs]
  );

  const validationNotices = useMemo(() => {
    const notices: { level: 'warning' | 'info' | 'ok'; text: string }[] = [];
    if (!metadata) return notices;

    if (!metadata.isVertical916) {
      notices.push({
        level: 'warning',
        text: `Detected ${metadata.aspectRatioLabel} (${metadata.width}×${metadata.height}). Vertical 9:16 (1080×1920) is recommended to prevent auto-cropping.`,
      });
    } else {
      notices.push({
        level: 'ok',
        text: `Vertical 9:16 framing verified (${metadata.width}×${metadata.height}). Ready for full-bleed short feeds.`,
      });
    }

    if (metadata.fileSizeBytes > 250 * 1024 * 1024) {
      notices.push({
        level: 'warning',
        text: 'File exceeds 250 MB. Consider exporting H.264 10–15 Mbps for faster mobile upload.',
      });
    }

    enabledPlatformIds.forEach((pid) => {
      const limit = platforms[pid].maxDurationSec;
      if (metadata.durationSec > limit) {
        notices.push({
          level: 'warning',
          text: `${platforms[pid].name} caps clips at ${limit}s (current clip is ${Math.round(
            metadata.durationSec
          )}s).`,
        });
      }
    });

    return notices;
  }, [metadata, enabledPlatformIds, platforms]);

  const handleVideoFile = async (file: File) => {
    const allowedExt = /\.(mp4|mov|webm|m4v)$/i.test(file.name);
    const allowedMime = file.type.startsWith('video/');
    if (!allowedExt && !allowedMime) {
      onNotify(
        'error',
        'Unsupported file format',
        'Please upload an MP4, MOV, or WebM short-form video.'
      );
      return;
    }

    setIsInspecting(true);
    try {
      const result = await inspectVideoFile(file);
      setVideoObjectUrl(result.objectUrl);
      setMetadata(result.metadata);
      setThumbnailUrl(result.initialThumbnailUrl || undefined);
      setCoverTimestampSec(
        result.metadata.durationSec > 0.5
          ? Number(Math.min(0.4, result.metadata.durationSec * 0.2).toFixed(1))
          : 0
      );
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      onNotify(
        'success',
        'Video inspected locally',
        `${result.metadata.aspectRatioLabel} · ${formatDuration(
          result.metadata.durationSec
        )} · ${formatBytes(result.metadata.fileSizeBytes)}`
      );
    } catch (err) {
      onNotify(
        'error',
        'Failed to inspect video',
        err instanceof Error ? err.message : 'Unable to load local video file.'
      );
    } finally {
      setIsInspecting(false);
    }
  };

  const handleGenerateSample = async () => {
    setIsGeneratingSample(true);
    try {
      const sampleFile = await generateSampleVerticalClip();
      await handleVideoFile(sampleFile);
    } catch (err) {
      onNotify(
        'error',
        'Sample generation unavailable',
        err instanceof Error ? err.message : 'Try dropping a local MP4 or MOV file.'
      );
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const handleCoverScrub = (nextSec: number) => {
    setCoverTimestampSec(nextSec);
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.currentTime = nextSec;
    const onSeeked = () => {
      const frame = captureFrameAtTimestamp(videoEl);
      if (frame) setThumbnailUrl(frame);
      videoEl.removeEventListener('seeked', onSeeked);
    };
    videoEl.addEventListener('seeked', onSeeked);
  };

  const handleInsertHashtag = (tag: string) => {
    setSharedCaption((prev) => {
      if (prev.includes(tag)) return prev;
      const spacer = prev.length === 0 || prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' ';
      return `${prev}${spacer}${tag}`;
    });
  };

  const updatePlatformConfig = <K extends keyof PlatformPublishConfig>(
    pid: PlatformId,
    field: K,
    value: PlatformPublishConfig[K]
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [pid]: {
        ...prev[pid],
        [field]: value,
      },
    }));
  };

  const handleClearMedia = () => {
    setVideoObjectUrl(undefined);
    setThumbnailUrl(undefined);
    setMetadata(null);
    setCoverTimestampSec(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (modeOverride?: 'now' | 'schedule' | 'draft') => {
    const finalMode = modeOverride ?? publishMode;

    if (!permissions.canUploadAndCompose) {
      onNotify(
        'warning',
        'Read-only role active',
        'Switch to Creator, Editor, or Admin in the Admin Panel to publish or schedule.'
      );
      return;
    }

    if (finalMode === 'now' && !permissions.canPublishImmediately) {
      onNotify(
        'warning',
        'Editor role cannot publish live',
        'Editors can Schedule or Save Draft. Switch to Creator or Admin to publish immediately.'
      );
      return;
    }

    if (!metadata) {
      onNotify(
        'warning',
        'No video selected',
        'Drop an MP4/MOV file or click "Load Sample 9:16 Clip" first.'
      );
      return;
    }

    if (enabledPlatformIds.length === 0) {
      onNotify(
        'warning',
        'Select at least one platform',
        'Enable TikTok, Instagram Reels, YouTube Shorts, or Snapchat.'
      );
      return;
    }

    if (finalMode === 'schedule' && !scheduledFor) {
      onNotify('warning', 'Choose a schedule time', 'Select a date and time for publishing.');
      return;
    }

    onSubmitReel({
      id: editingReel?.id,
      title: title.trim() || metadata.fileName,
      sharedCaption: sharedCaption.trim(),
      coverTimestampSec,
      thumbnailUrl,
      videoObjectUrl,
      metadata,
      publishMode: finalMode,
      scheduledFor: finalMode === 'schedule' ? scheduledFor : undefined,
      configs,
    });

    if (!editingReel) {
      // Optimistically clear composer for next reel
      handleClearMedia();
      setTitle('');
      setSharedCaption('');
      setConfigs(structuredClone(DEFAULT_PLATFORM_CONFIGS));
    }
  };

  const shortestCaptionLimit = useMemo(() => {
    if (enabledPlatformIds.length === 0) return 2200;
    return Math.min(...enabledPlatformIds.map((pid) => platforms[pid].maxCaptionLength));
  }, [enabledPlatformIds, platforms]);

  return (
    <div className="space-y-6">
      {/* Studio Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-200/80 dark:border-blue-900/70">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-blue-950 dark:text-blue-50 text-balance">
            {editingReel ? 'Edit Reel Draft & Targets' : 'Upload & Composer Studio'}
          </h1>
          <p className="text-sm text-blue-800/80 dark:text-blue-200/75 mt-0.5">
            Upload once, inspect local framing, and sync across all connected short-form channels.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-blue-800/80 dark:text-blue-300/75">
          <span>
            Active Role:{' '}
            <strong className="text-blue-950 dark:text-blue-50 font-medium capitalize">
              {currentRole}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>{currentUserName}</span>
          {editingReel && (
            <>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium whitespace-nowrap"
              >
                Cancel Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Role restriction notice for Viewer / Editor */}
      {!permissions.canUploadAndCompose && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200 dark:border-blue-900/70 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-950 dark:text-blue-50">
                Viewer role is read-only
              </p>
              <p className="text-xs text-blue-800/80 dark:text-blue-200/75 mt-0.5">
                You can inspect the studio layout, but uploading and publishing require Creator, Editor, or Admin permissions.
              </p>
            </div>
          </div>
          {isOwnerAdmin && (
            <button
              type="button"
              onClick={onGoToAdmin}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100 transition-colors whitespace-nowrap shrink-0"
            >
              Switch Role in Admin
            </button>
          )}
        </div>
      )}

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Video Dropzone, HTML5 Preview, Cover Scrub & Metadata */}
        <section className="lg:col-span-5 bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-semibold text-blue-950 dark:text-blue-50">
              Source Media
            </h2>
            {metadata && (
              <button
                type="button"
                onClick={handleClearMedia}
                className="inline-flex items-center gap-1 text-xs text-blue-700/80 hover:text-red-600 dark:text-blue-300/75 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Replace Video</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoFile(file);
            }}
          />

          {!metadata ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleVideoFile(file);
              }}
              className={`relative border border-dashed rounded-2xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/12'
                  : 'border-blue-300 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600 bg-[#F2F7FF]/80 dark:bg-[#051024]/85'
              }`}
            >
              {/* Subtle Studio Viewfinder Corner Brackets */}
              <span aria-hidden="true" className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-blue-500/45 rounded-tl-sm" />
              <span aria-hidden="true" className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-blue-500/45 rounded-tr-sm" />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-blue-500/45 rounded-bl-sm" />
              <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-blue-500/45 rounded-br-sm" />

              <div className="mx-auto w-12 h-12 rounded-xl bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 flex items-center justify-center mb-4 shadow-xs">
                <Upload className="w-5 h-5 text-blue-700 dark:text-blue-300" />
              </div>

              <p className="text-sm font-semibold text-blue-950 dark:text-blue-50">
                {isInspecting
                  ? 'Inspecting video metadata...'
                  : 'Drop your Reel or Short here'}
              </p>
              <p className="text-xs text-blue-800/80 dark:text-blue-200/75 mt-1.5 max-w-xs mx-auto leading-relaxed">
                MP4, MOV, or WebM · Recommended 1080×1920 (9:16) · Up to 60s for Shorts & Spotlight
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  disabled={!permissions.canUploadAndCompose || isInspecting}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white dark:from-blue-500 dark:to-sky-400 dark:hover:from-blue-400 dark:hover:to-sky-300 dark:text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs whitespace-nowrap"
                >
                  Choose Video File
                </button>
                <button
                  type="button"
                  disabled={!permissions.canUploadAndCompose || isGeneratingSample}
                  onClick={handleGenerateSample}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
                  <span>
                    {isGeneratingSample ? 'Generating Clip...' : 'Load Sample 9:16 Clip'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vertical HTML5 Video Preview Frame */}
              <div className="relative mx-auto w-full max-w-[280px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-800/80 shadow-lg">
                {videoObjectUrl ? (
                  <video
                    ref={videoRef}
                    src={videoObjectUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain bg-black"
                  />
                ) : thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={title || metadata.fileName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-blue-300/70 p-4 text-center">
                    <Film className="w-8 h-8 mb-2" />
                    <span className="text-xs">{metadata.fileName}</span>
                  </div>
                )}
              </div>

              {/* Lightweight Metadata Readout (Zero-Pill unboxed text with separators) */}
              <div className="pt-2 border-t border-blue-200/80 dark:border-blue-900/70 space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-800/80 dark:text-blue-200/75">
                  <span className="truncate max-w-[200px] text-blue-950 dark:text-blue-50 font-medium">
                    {metadata.fileName}
                  </span>
                  <span className="font-mono tabular-nums text-blue-700/80 dark:text-blue-300/75">
                    {formatBytes(metadata.fileSizeBytes)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-blue-700/80 dark:text-blue-300/75 font-mono tabular-nums">
                  <span>{formatDuration(metadata.durationSec)}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {metadata.width}×{metadata.height}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{metadata.aspectRatioLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase">{metadata.mimeType.split('/')[1] || 'MP4'}</span>
                </div>
              </div>

              {/* Cover / Thumbnail Frame Selector */}
              {videoObjectUrl && metadata.durationSec > 0 && (
                <div className="pt-3 border-t border-blue-200/80 dark:border-blue-900/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-blue-950 dark:text-blue-50">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-700/80 dark:text-blue-300/75" />
                      Cover Frame Timestamp
                    </span>
                    <span className="font-mono tabular-nums text-blue-700/80 dark:text-blue-300/75">
                      {coverTimestampSec.toFixed(1)}s / {metadata.durationSec.toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {thumbnailUrl && (
                      <img
                        src={thumbnailUrl}
                        alt="Selected cover frame"
                        referrerPolicy="no-referrer"
                        className="w-9 h-16 rounded-lg object-cover border border-blue-300 dark:border-blue-800 shrink-0"
                      />
                    )}
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0.5, Number(metadata.durationSec.toFixed(1)))}
                      step={0.1}
                      value={coverTimestampSec}
                      onChange={(e) => handleCoverScrub(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 dark:accent-blue-400 cursor-pointer"
                      aria-label="Cover frame timestamp"
                    />
                  </div>
                </div>
              )}

              {/* Validation & Aspect Tips */}
              {validationNotices.length > 0 && (
                <div className="pt-3 border-t border-blue-200/80 dark:border-blue-900/70 space-y-2">
                  {validationNotices.map((notice, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed"
                    >
                      {notice.level === 'ok' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          notice.level === 'ok'
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-amber-700 dark:text-amber-300'
                        }
                      >
                        {notice.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Column (7 cols): Captions, Platform Selectors, Schedule & Publish */}
        <section className="lg:col-span-7 space-y-5">
          {/* Title & Shared Caption */}
          <div className="bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)]">
            <div>
              <label
                htmlFor="reel-internal-title"
                className="block text-xs font-medium text-blue-900 dark:text-blue-200 mb-1.5"
              >
                Internal Reel Title
              </label>
              <input
                id="reel-internal-title"
                type="text"
                value={title}
                disabled={!permissions.canUploadAndCompose}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Studio Camera Rig Breakdown"
                className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none disabled:opacity-50 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="reel-shared-caption"
                  className="text-xs font-medium text-blue-900 dark:text-blue-200"
                >
                  Shared Caption & Description
                </label>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    sharedCaption.length > shortestCaptionLimit
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-blue-700/75 dark:text-blue-400/70'
                  }`}
                >
                  {sharedCaption.length} / {shortestCaptionLimit.toLocaleString()}
                </span>
              </div>

              <textarea
                id="reel-shared-caption"
                rows={4}
                value={sharedCaption}
                disabled={!permissions.canUploadAndCompose}
                onChange={(e) => setSharedCaption(e.target.value)}
                placeholder="Write your hook, context, and call to action once. Toggle per-platform overrides below if needed..."
                className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none resize-y disabled:opacity-50 transition-colors"
              />

              {/* Hashtags Quick Insert */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs text-blue-700/75 dark:text-blue-400/70 mr-1">
                  <Hash className="w-3 h-3" />
                  Quick add:
                </span>
                {QUICK_HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    disabled={!permissions.canUploadAndCompose}
                    onClick={() => handleInsertHashtag(tag)}
                    className="px-2.5 py-1 rounded-lg text-xs text-blue-800 dark:text-blue-200 bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-950 dark:hover:text-white disabled:opacity-40 transition-colors whitespace-nowrap"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Selector Hairline List */}
          <div className="bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-sm font-semibold text-blue-950 dark:text-blue-50">
                  Target Platforms
                </h2>
                <p className="text-xs text-blue-800/80 dark:text-blue-200/75 mt-0.5">
                  Toggle channels, adjust platform fields, or override captions individually.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAccountsModal}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 whitespace-nowrap shrink-0"
              >
                {isOwnerAdmin ? 'Manage Connections' : 'View Channels'}
              </button>
            </div>

            <div className="divide-y divide-blue-200/75 dark:divide-blue-900/70 border-y border-blue-200/75 dark:border-blue-900/70">
              {PLATFORM_ORDER.map((pid) => {
                const conn = platforms[pid];
                const cfg = configs[pid];

                return (
                  <div key={pid} className="py-3.5 space-y-3">
                    {/* Platform Row Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={getPlatformAccentText(pid)}>
                          <PlatformIcon platformId={pid} className="w-4 h-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-blue-950 dark:text-blue-50">
                              {conn.name}
                            </span>
                            <span className="text-xs text-blue-500/70" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-xs text-blue-800/80 dark:text-blue-200/75 truncate">
                              {conn.handle}
                            </span>
                            <span className="text-xs text-blue-500/70" aria-hidden="true">
                              ·
                            </span>
                            <span
                              className={`text-xs ${
                                !conn.connected
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : conn.apiMode === 'live'
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-sky-700 dark:text-sky-300'
                              }`}
                            >
                              {!conn.connected
                                ? 'Needs API Setup'
                                : conn.apiMode === 'live'
                                ? 'Live API'
                                : 'Sandbox Ready'}
                            </span>
                          </div>
                          {conn.channelUrl && (
                            <a
                              href={conn.channelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-700/75 hover:text-blue-950 dark:text-blue-400/70 dark:hover:text-blue-200 mt-0.5 truncate max-w-xs"
                            >
                              <span className="truncate">{conn.channelUrl}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={cfg.enabled}
                        disabled={!permissions.canUploadAndCompose}
                        onClick={() => updatePlatformConfig(pid, 'enabled', !cfg.enabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 ${
                          cfg.enabled
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-blue-200 dark:bg-blue-900'
                        }`}
                      >
                        <span className="sr-only">Enable {conn.name}</span>
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-150 ${
                            cfg.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Expanded Platform-Specific Fields */}
                    {cfg.enabled && (
                      <div className="pt-2 pl-7 space-y-3">
                        {!conn.connected && (
                          <div className="flex items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-lg px-3 py-2">
                            <span>
                              This platform is disconnected. Publishing will pause as &ldquo;Needs API Setup&rdquo; until connected.
                            </span>
                            <button
                              type="button"
                              onClick={onOpenAccountsModal}
                              className="text-amber-900 dark:text-amber-200 underline underline-offset-2 whitespace-nowrap shrink-0 font-medium"
                            >
                              Connect
                            </button>
                          </div>
                        )}

                        {/* YouTube Shorts Fields */}
                        {pid === 'youtube' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-xs text-blue-800/80 dark:text-blue-300/75 mb-1">
                                Shorts Title (max 100 chars)
                              </label>
                              <input
                                type="text"
                                maxLength={100}
                                value={cfg.youtubeTitle || ''}
                                onChange={(e) =>
                                  updatePlatformConfig('youtube', 'youtubeTitle', e.target.value)
                                }
                                placeholder={
                                  title ? `${title} #Shorts` : 'Enter YouTube Shorts title...'
                                }
                                className="w-full bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-blue-800/80 dark:text-blue-300/75 mb-1">
                                Visibility
                              </label>
                              <select
                                value={cfg.youtubePrivacy || 'public'}
                                onChange={(e) =>
                                  updatePlatformConfig(
                                    'youtube',
                                    'youtubePrivacy',
                                    e.target.value as 'public' | 'unlisted' | 'private'
                                  )
                                }
                                className="w-full bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-blue-950 dark:text-blue-50 focus:outline-none"
                              >
                                <option value="public">Public</option>
                                <option value="unlisted">Unlisted</option>
                                <option value="private">Private</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* TikTok Fields */}
                        {pid === 'tiktok' && (
                          <div className="flex flex-wrap items-center gap-4 text-xs text-blue-900 dark:text-blue-200">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-800/80 dark:text-blue-300/75">
                                Privacy:
                              </span>
                              <select
                                value={cfg.tiktokPrivacy || 'public'}
                                onChange={(e) =>
                                  updatePlatformConfig(
                                    'tiktok',
                                    'tiktokPrivacy',
                                    e.target.value as 'public' | 'friends' | 'private'
                                  )
                                }
                                className="bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 rounded px-2 py-1 text-xs text-blue-950 dark:text-blue-50 focus:outline-none"
                              >
                                <option value="public">Everyone</option>
                                <option value="friends">Friends</option>
                                <option value="private">Only me</option>
                              </select>
                            </div>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.tiktokAllowComments ?? true}
                                onChange={(e) =>
                                  updatePlatformConfig(
                                    'tiktok',
                                    'tiktokAllowComments',
                                    e.target.checked
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400 rounded"
                              />
                              <span>Comments</span>
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.tiktokAllowDuet ?? true}
                                onChange={(e) =>
                                  updatePlatformConfig(
                                    'tiktok',
                                    'tiktokAllowDuet',
                                    e.target.checked
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400 rounded"
                              />
                              <span>Duet</span>
                            </label>
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.tiktokAllowStitch ?? true}
                                onChange={(e) =>
                                  updatePlatformConfig(
                                    'tiktok',
                                    'tiktokAllowStitch',
                                    e.target.checked
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400 rounded"
                              />
                              <span>Stitch</span>
                            </label>
                          </div>
                        )}

                        {/* Instagram Reels Fields */}
                        {pid === 'instagram' && (
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={cfg.instagramShareToFeed ?? true}
                                onChange={(e) =>
                                  updatePlatformConfig(
                                    'instagram',
                                    'instagramShareToFeed',
                                    e.target.checked
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400 rounded"
                              />
                              <span>Also share cover preview to profile grid</span>
                            </label>
                            <span className="font-mono tabular-nums text-blue-700/75 dark:text-blue-400/70">
                              Cover at {coverTimestampSec.toFixed(1)}s
                            </span>
                          </div>
                        )}

                        {/* Snapchat Fields */}
                        {pid === 'snapchat' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-blue-800/80 dark:text-blue-300/75 mb-1">
                                Spotlight Topic
                              </label>
                              <input
                                type="text"
                                value={cfg.snapchatSpotlightTopic || ''}
                                onChange={(e) =>
                                  updatePlatformConfig(
                                    'snapchat',
                                    'snapchatSpotlightTopic',
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Behind the Scenes"
                                className="w-full bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none"
                              />
                            </div>
                            <div className="flex items-end text-xs text-blue-700/75 dark:text-blue-400/70 pb-1.5">
                              Spotlight captions auto-trim cleanly at {conn.maxCaptionLength} chars.
                            </div>
                          </div>
                        )}

                        {/* Optional Per-Platform Caption Override Toggle */}
                        <div className="pt-1">
                          <label className="inline-flex items-center gap-2 text-xs text-blue-800/80 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.overrideCaption}
                              onChange={(e) =>
                                updatePlatformConfig(
                                  pid,
                                  'overrideCaption',
                                  e.target.checked
                                )
                              }
                              className="accent-blue-600 dark:accent-blue-400 rounded"
                            />
                            <span>Customize caption specifically for {conn.shortName}</span>
                          </label>

                          {cfg.overrideCaption && (
                            <div className="mt-2">
                              <textarea
                                rows={2}
                                maxLength={conn.maxCaptionLength}
                                value={cfg.customCaption}
                                onChange={(e) =>
                                  updatePlatformConfig(pid, 'customCaption', e.target.value)
                                }
                                placeholder={`Custom ${conn.shortName} caption (max ${conn.maxCaptionLength} chars)...`}
                                className="w-full bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/40 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Publish Timing & Submission Bar */}
          <div className="bg-white/90 dark:bg-[#0A1A38]/85 backdrop-blur-md border border-blue-200/90 dark:border-blue-900/70 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex items-center p-1 bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 rounded-xl self-start">
                <button
                  type="button"
                  onClick={() => setPublishMode('now')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    publishMode === 'now'
                      ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950 shadow-xs'
                      : 'text-blue-800/80 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode('schedule')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    publishMode === 'schedule'
                      ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950 shadow-xs'
                      : 'text-blue-800/80 hover:text-blue-950 dark:text-blue-300/75 dark:hover:text-blue-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule for Later</span>
                </button>
              </div>

              {publishMode === 'schedule' && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-700/80 dark:text-blue-300/75 shrink-0" />
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs font-mono text-blue-950 dark:text-blue-50 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {publishMode === 'now' && !permissions.canPublishImmediately && permissions.canUploadAndCompose && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Your current role ({currentRole}) can Schedule or Save Drafts. Switch to Creator or Admin for immediate publishing.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-blue-200/80 dark:border-blue-900/70">
              <div className="text-xs text-blue-800/80 dark:text-blue-300/75 tabular-nums">
                {enabledPlatformIds.length} of {PLATFORM_ORDER.length} platforms selected
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={!permissions.canUploadAndCompose}
                  onClick={() => handleSubmit('draft')}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:hover:bg-blue-800 dark:text-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={
                    !permissions.canUploadAndCompose ||
                    (publishMode === 'now' && !permissions.canPublishImmediately)
                  }
                  onClick={() => handleSubmit()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white dark:from-blue-500 dark:to-sky-400 dark:hover:from-blue-400 dark:hover:to-sky-300 dark:text-slate-950 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                >
                  {publishMode === 'now' ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish Reel Now</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Reel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
