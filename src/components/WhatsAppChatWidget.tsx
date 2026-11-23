import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageSquare, Send, Settings2, X } from 'lucide-react';
import { UserRole, WhatsAppConfig } from '../types/reelsync';

interface WhatsAppChatWidgetProps {
  config: WhatsAppConfig;
  currentRole: UserRole;
  onOpenAdminSettings: () => void;
}

export const WhatsAppIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.77 14.01c-.24.68-1.41 1.3-1.95 1.38-.51.08-1.15.11-1.85-.11-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.29-5.06-4.49-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .39.01.56.01.18 0 .42-.07.66.51.24.58.83 2.02.9 2.17.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.53-.15.15-.3.31-.13.61.18.3.78 1.29 1.68 2.09 1.15 1.03 2.13 1.35 2.43 1.5.3.15.48.13.66-.07.18-.2.76-.88.96-1.18.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.13.07.75-.17 1.43z" />
  </svg>
);

function sanitizePhoneDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('0') && digits.length === 11 && digits.startsWith('03')) {
    return `92${digits.slice(1)}`;
  }
  return digits;
}

export const WhatsAppChatWidget: React.FC<WhatsAppChatWidgetProps> = ({
  config,
  currentRole,
  onOpenAdminSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(config.defaultMessage);

  useEffect(() => {
    setMessage(config.defaultMessage);
  }, [config.defaultMessage]);

  if (!config.enabled) return null;

  const digits = sanitizePhoneDigits(config.phoneNumber);
  const encodedText = encodeURIComponent(
    message.trim() || config.defaultMessage || 'Hi! I have a question about ReelSync.'
  );
  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          role="dialog"
          aria-label="WhatsApp Chat"
          className="w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-xs font-semibold text-zinc-100 truncate">
                  {config.displayName || 'WhatsApp Support'}
                </p>
                <p className="text-[11px] font-mono text-zinc-400 truncate">
                  {config.phoneNumber || 'Set number in Admin Panel'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp chat"
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-3 leading-relaxed">
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5" />
              <span>
                Send a message to start a direct WhatsApp conversation with our team.
              </span>
            </div>

            <div>
              <label
                htmlFor="wa-chat-message"
                className="block text-[11px] font-medium text-zinc-400 mb-1"
              >
                Your message
              </label>
              <textarea
                id="wa-chat-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#25D366] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              {currentRole === 'admin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAdminSettings();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors whitespace-nowrap"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Edit number</span>
                </button>
              ) : (
                <span className="text-[11px] text-zinc-500">Opens WhatsApp</span>
              )}

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#22c35e] text-zinc-950 transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Start Chat</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Chat Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
        aria-expanded={isOpen}
        title="Chat on WhatsApp"
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#22c35e] text-zinc-950 shadow-lg border border-[#25D366]/50 flex items-center justify-center transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <WhatsAppIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};
