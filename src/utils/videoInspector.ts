import { VideoMetadata } from '../types/reelsync';

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, idx);
  return `${val >= 10 || idx === 0 ? val.toFixed(0) : val.toFixed(1)} ${units[idx]}`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function computeAspectRatioLabel(width: number, height: number): {
  label: string;
  isVertical916: boolean;
} {
  if (!width || !height) {
    return { label: 'Unknown', isVertical916: false };
  }
  const ratio = width / height;
  const target916 = 9 / 16;
  const isVertical916 = Math.abs(ratio - target916) <= 0.08;

  if (isVertical916) return { label: '9:16', isVertical916: true };
  if (Math.abs(ratio - 16 / 9) <= 0.08) return { label: '16:9', isVertical916: false };
  if (Math.abs(ratio - 1) <= 0.06) return { label: '1:1', isVertical916: false };
  if (Math.abs(ratio - 4 / 5) <= 0.06) return { label: '4:5', isVertical916: false };

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(width, height);
  return {
    label: `${Math.round(width / d)}:${Math.round(height / d)}`,
    isVertical916: height > width,
  };
}

export function inspectVideoFile(file: File): Promise<{
  objectUrl: string;
  metadata: VideoMetadata;
  initialThumbnailUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const cleanupError = (reason: string) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(reason));
    };

    video.onloadedmetadata = () => {
      const durationSec = Number.isFinite(video.duration) ? video.duration : 0;
      const width = video.videoWidth || 1080;
      const height = video.videoHeight || 1920;
      const { label, isVertical916 } = computeAspectRatioLabel(width, height);

      const seekTarget = durationSec > 0.5 ? Math.min(0.4, durationSec * 0.2) : 0;
      video.currentTime = seekTarget;

      const captureFrame = () => {
        let thumbnailUrl = '';
        try {
          const canvas = document.createElement('canvas');
          const targetWidth = 360;
          const targetHeight = Math.round((height / width) * targetWidth) || 640;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            thumbnailUrl = canvas.toDataURL('image/jpeg', 0.82);
          }
        } catch {
          thumbnailUrl = '';
        }

        resolve({
          objectUrl,
          metadata: {
            fileName: file.name,
            fileSizeBytes: file.size,
            durationSec,
            width,
            height,
            aspectRatioLabel: label,
            isVertical916,
            mimeType: file.type || 'video/mp4',
          },
          initialThumbnailUrl: thumbnailUrl,
        });
      };

      video.onseeked = captureFrame;
      // Fallback in case seeked event doesn't fire on short synthetic clips
      setTimeout(() => {
        if (!video.ended && video.readyState >= 2) {
          captureFrame();
        }
      }, 350);
    };

    video.onerror = () => {
      cleanupError('Could not read video metadata. Please select a valid MP4, MOV, or WebM clip.');
    };

    video.src = objectUrl;
  });
}

export function captureFrameAtTimestamp(
  videoElement: HTMLVideoElement
): string | null {
  try {
    const width = videoElement.videoWidth || 360;
    const height = videoElement.videoHeight || 640;
    const canvas = document.createElement('canvas');
    const targetWidth = 360;
    const targetHeight = Math.round((height / width) * targetWidth) || 640;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

/**
 * Generates a real playable 9:16 short-form sample video using Canvas + MediaRecorder
 * so users can test upload, preview, scrubbing, metadata inspection, and publishing immediately.
 */
export function generateSampleVerticalClip(): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof MediaRecorder === 'undefined') {
      reject(new Error('Browser does not support local sample generation.'));
      return;
    }

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 1_500_000,
    });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunks.push(ev.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], 'studio_test_reel_9x16.webm', {
        type: 'video/webm',
      });
      resolve(file);
    };

    let frame = 0;
    const totalFrames = 90; // 3 seconds at 30fps
    recorder.start();

    const draw = () => {
      const progress = frame / totalFrames;
      // Rich dark editorial gradient background
      const grad = ctx.createLinearGradient(0, 0, 540, 960);
      grad.addColorStop(0, '#09090B');
      grad.addColorStop(0.5, '#18181B');
      grad.addColorStop(1, '#1E293B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 540, 960);

      // Subtle moving geometric lens rings
      const cx = 270;
      const cy = 430 + Math.sin(progress * Math.PI * 2) * 18;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * 48 + progress * 16, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.42 - r * 0.08})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Studio framing markers
      ctx.strokeStyle = 'rgba(244, 244, 245, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(36, 64, 468, 832);

      // Center label
      ctx.fillStyle = '#F4F4F5';
      ctx.font = '600 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ReelSync Studio Take', 270, 425);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 18px monospace';
      ctx.fillText(`9:16 VERTICAL · ${(progress * 3).toFixed(1)}s / 3.0s`, 270, 462);

      // Progress bar at bottom
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(72, 820, 396, 6);
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(72, 820, 396 * progress, 6);

      frame += 1;
      if (frame <= totalFrames) {
        requestAnimationFrame(draw);
      } else {
        recorder.stop();
      }
    };

    draw();
  });
}
