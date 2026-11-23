import React from 'react';
import { PlatformId } from '../types/reelsync';

interface PlatformIconProps {
  platformId: PlatformId;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platformId,
  className = 'w-4 h-4',
}) => {
  switch (platformId) {
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'snapchat':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12.206 2.1c2.87 0 4.862 1.84 5.012 4.71.05.95-.03 1.98-.11 2.66.44.14.95.12 1.33-.04.22-.09.45-.14.68-.14.48 0 .88.29.96.71.08.43-.17.85-.62 1.03-.42.17-.92.32-1.29.66-.32.3-.26.79-.05 1.19.72 1.36 1.89 2.34 3.24 2.75.43.13.68.47.64.86-.05.45-.44.78-.98.89-.65.13-1.26.27-1.69.62-.31.25-.44.66-.56 1.06-.14.47-.49.75-.98.75-.32 0-.65-.1-1-.22-.6-.2-1.24-.35-1.91-.35-.66 0-1.3.15-1.9.35-.35.12-.68.22-1 .22-.49 0-.84-.28-.98-.75-.12-.4-.25-.81-.56-1.06-.43-.35-1.04-.49-1.69-.62-.54-.11-.93-.44-.98-.89-.04-.39.21-.73.64-.86 1.35-.41 2.52-1.39 3.24-2.75.21-.4.27-.89-.05-1.19-.37-.34-.87-.49-1.29-.66-.45-.18-.7-.6-.62-1.03.08-.42.48-.71.96-.71.23 0 .46.05.68.14.38.16.89.18 1.33.04-.08-.68-.16-1.71-.11-2.66.15-2.87 2.14-4.71 5.01-4.71z" />
        </svg>
      );
  }
};

export function getPlatformAccentText(platformId: PlatformId): string {
  switch (platformId) {
    case 'tiktok':
      return 'text-blue-950 dark:text-zinc-100';
    case 'instagram':
      return 'text-rose-600 dark:text-rose-400';
    case 'youtube':
      return 'text-red-600 dark:text-red-400';
    case 'snapchat':
      return 'text-amber-600 dark:text-amber-300';
  }
}
