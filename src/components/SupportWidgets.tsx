import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  Send,
  Settings2,
  X,
} from 'lucide-react';
import { TranslationStrings } from '../i18n/translations';
import {
  ActiveWorkspaceView,
  GmailSupportConfig,
  SupportedLanguage,
  UserRole,
  WhatsAppConfig,
} from '../types/reelsync';
import { HelpChatbot } from './HelpChatbot';
import { WhatsAppIcon } from './WhatsAppChatWidget';

interface SupportWidgetsProps {
  whatsAppConfig: WhatsAppConfig;
  gmailConfig: GmailSupportConfig;
  isOwnerAdmin: boolean;
  currentRole: UserRole;
  onOpenAdminSettings: () => void;
  isHelpBotOpen: boolean;
  onToggleHelpBot: () => void;
  onCloseHelpBot: () => void;
  language: SupportedLanguage;
  currentView: ActiveWorkspaceView;
  t: TranslationStrings;
}

export const GmailIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const GmailEnvelopeMark: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#EA4335"
      d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
    />
  </svg>
);

function sanitizePhoneDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('0') && digits.length === 11 && digits.startsWith('03')) {
    return `92${digits.slice(1)}`;
  }
  return digits;
}

export const SupportWidgets: React.FC<SupportWidgetsProps> = ({
  whatsAppConfig,
  gmailConfig,
  isOwnerAdmin,
  currentRole,
  onOpenAdminSettings,
  isHelpBotOpen,
  onToggleHelpBot,
  onCloseHelpBot,
  language,
  currentView,
  t,
}) => {
  const [openChannel, setOpenChannel] = useState<'whatsapp' | 'gmail' | null>(null);
  const [waMessage, setWaMessage] = useState(whatsAppConfig.defaultMessage);
  const [emailSubject, setEmailSubject] = useState(gmailConfig.defaultSubject);
  const [emailBody, setEmailBody] = useState(gmailConfig.defaultMessage);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    setWaMessage(whatsAppConfig.defaultMessage);
  }, [whatsAppConfig.defaultMessage]);

  useEffect(() => {
    setEmailSubject(gmailConfig.defaultSubject);
    setEmailBody(gmailConfig.defaultMessage);
  }, [gmailConfig.defaultSubject, gmailConfig.defaultMessage]);

  useEffect(() => {
    if (isHelpBotOpen) {
      setOpenChannel(null);
    }
  }, [isHelpBotOpen]);

  const digits = sanitizePhoneDigits(whatsAppConfig.phoneNumber);
  const encodedWaText = encodeURIComponent(
    waMessage.trim() ||
      whatsAppConfig.defaultMessage ||
      'Hi! I have a question about ReelSync.'
  );
  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodedWaText}`
    : `https://wa.me/?text=${encodedWaText}`;

  const recipientEmail = gmailConfig.email.trim() || 'alobli456@gmail.com';
  const encodedSubject = encodeURIComponent(
    emailSubject.trim() || gmailConfig.defaultSubject || 'ReelSync Support Inquiry'
  );
  const encodedBody = encodeURIComponent(
    emailBody.trim() ||
      gmailConfig.defaultMessage ||
      'Hi! I have a question about ReelSync.'
  );
  const gmailWebHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail
  )}&su=${encodedSubject}&body=${encodedBody}`;
  const mailtoHref = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(recipientEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleToggleChannel = (channel: 'whatsapp' | 'gmail') => {
    onCloseHelpBot();
    setOpenChannel((prev) => (prev === channel ? null : channel));
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
      {/* Gmail Support Popover */}
      <AnimatePresence>
        {openChannel === 'gmail' && gmailConfig.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Gmail Support"
            className="w-80 bg-white dark:bg-[#07132A] border border-blue-200 dark:border-blue-800/80 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#F2F7FF] dark:bg-[#0A1A38] border-b border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <GmailEnvelopeMark className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xs font-semibold text-blue-950 dark:text-blue-50 truncate">
                    {gmailConfig.displayName || 'Gmail Support'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-mono text-blue-800/80 dark:text-blue-200/75 truncate">
                      {recipientEmail}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      title="Copy email address"
                      className="text-blue-700/70 hover:text-blue-950 dark:text-blue-300/70 dark:hover:text-blue-100 transition-colors shrink-0"
                    >
                      {copiedEmail ? (
                        <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenChannel(null)}
                aria-label="Close Gmail support"
                className="p-1 rounded-md text-blue-700 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-50 dark:hover:bg-blue-900/60 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label
                  htmlFor="gmail-support-subject"
                  className="block text-[11px] font-medium text-blue-800 dark:text-blue-200/80 mb-1"
                >
                  Subject
                </label>
                <input
                  id="gmail-support-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject..."
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="gmail-support-body"
                  className="block text-[11px] font-medium text-blue-800 dark:text-blue-200/80 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="gmail-support-body"
                  rows={3}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email..."
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                {isOwnerAdmin && currentRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenChannel(null);
                      onOpenAdminSettings();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-950 dark:text-blue-300/80 dark:hover:text-blue-100 transition-colors whitespace-nowrap"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Edit email</span>
                  </button>
                ) : (
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-950 dark:text-blue-300/80 dark:hover:text-blue-100 transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Default Mail App</span>
                  </a>
                )}

                <a
                  href={gmailWebHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-50 dark:hover:bg-white dark:text-slate-950 transition-colors whitespace-nowrap"
                >
                  <GmailIcon className="w-3.5 h-3.5" />
                  <span>Send via Gmail</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Chat Popover */}
      <AnimatePresence>
        {openChannel === 'whatsapp' && whatsAppConfig.enabled && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="WhatsApp Chat"
            className="w-80 bg-white dark:bg-[#07132A] border border-blue-200 dark:border-blue-800/80 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#F2F7FF] dark:bg-[#0A1A38] border-b border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#16a34a] dark:text-[#25D366] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xs font-semibold text-blue-950 dark:text-blue-50 truncate">
                    {whatsAppConfig.displayName || 'WhatsApp Support'}
                  </p>
                  <p className="text-[11px] font-mono text-blue-800/80 dark:text-blue-200/75 truncate">
                    {whatsAppConfig.phoneNumber || 'Set number in Admin Panel'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenChannel(null)}
                aria-label="Close WhatsApp chat"
                className="p-1 rounded-md text-blue-700 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-50 dark:hover:bg-blue-900/60 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-100 bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200/80 dark:border-blue-800/70 rounded-lg p-3 leading-relaxed">
                <MessageSquare className="w-3.5 h-3.5 text-[#16a34a] dark:text-[#25D366] shrink-0 mt-0.5" />
                <span>
                  Send a message to start a direct WhatsApp conversation with our team.
                </span>
              </div>

              <div>
                <label
                  htmlFor="wa-chat-message"
                  className="block text-[11px] font-medium text-blue-800 dark:text-blue-200/80 mb-1"
                >
                  Your message
                </label>
                <textarea
                  id="wa-chat-message"
                  rows={3}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-[#25D366] rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                {isOwnerAdmin && currentRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenChannel(null);
                      onOpenAdminSettings();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-950 dark:text-blue-300/80 dark:hover:text-blue-100 transition-colors whitespace-nowrap"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Edit number</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-blue-700/80 dark:text-blue-300/70">
                    Opens WhatsApp
                  </span>
                )}

                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#25D366] hover:bg-[#22c35e] text-slate-950 transition-colors whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start Chat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Help Chatbot (dialog + floating launcher button) */}
      <HelpChatbot
        isOpen={isHelpBotOpen}
        onToggleOpen={() => {
          setOpenChannel(null);
          onToggleHelpBot();
        }}
        onClose={onCloseHelpBot}
        language={language}
        currentView={currentView}
        isOwnerAdmin={isOwnerAdmin}
        t={t}
      />

      {/* Floating Stacked Action Buttons: Gmail + WhatsApp */}
      {(gmailConfig.enabled || whatsAppConfig.enabled) && (
        <div className="flex flex-col items-end gap-2.5">
          {gmailConfig.enabled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleToggleChannel('gmail')}
              aria-label={
                openChannel === 'gmail'
                  ? 'Close Gmail support'
                  : 'Contact via Gmail'
              }
              aria-expanded={openChannel === 'gmail'}
              title={`Email via Gmail (${recipientEmail})`}
              className="w-11 h-11 rounded-full bg-white hover:bg-blue-50 dark:bg-[#0A1A38] dark:hover:bg-[#0F264D] text-blue-950 dark:text-blue-50 shadow-lg border border-blue-200 dark:border-blue-800 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {openChannel === 'gmail' ? (
                <X className="w-4 h-4" />
              ) : (
                <GmailEnvelopeMark className="w-5 h-5" />
              )}
            </motion.button>
          )}

          {whatsAppConfig.enabled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleToggleChannel('whatsapp')}
              aria-label={
                openChannel === 'whatsapp'
                  ? 'Close WhatsApp chat'
                  : 'Open WhatsApp chat'
              }
              aria-expanded={openChannel === 'whatsapp'}
              title="Chat on WhatsApp"
              className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#22c35e] text-slate-950 shadow-lg border border-[#25D366]/50 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAF2FF] dark:focus-visible:ring-offset-[#040B1A]"
            >
              {openChannel === 'whatsapp' ? (
                <X className="w-5 h-5" />
              ) : (
                <WhatsAppIcon className="w-6 h-6" />
              )}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};
