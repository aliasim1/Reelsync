import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Bot,
  MessageSquarePlus,
  RotateCcw,
  Send,
  User,
  X,
} from 'lucide-react';
import { TranslationStrings } from '../i18n/translations';
import { ActiveWorkspaceView, SupportedLanguage } from '../types/reelsync';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface HelpChatbotProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  language: SupportedLanguage;
  currentView: ActiveWorkspaceView;
  isOwnerAdmin: boolean;
  t: TranslationStrings;
}

export const HelpChatbot: React.FC<HelpChatbotProps> = ({
  isOpen,
  onToggleOpen,
  onClose,
  language,
  currentView,
  isOwnerAdmin,
  t,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: t.botGreeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement | null>(null);
  const isRtl = language === 'ur' || language === 'ar';

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ id: 'welcome', role: 'assistant', text: t.botGreeting }];
      }
      return prev;
    });
  }, [t.botGreeting]);

  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending]);

  const sendQuestion = async (rawQuestion: string, isRetry = false) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || isSending) return;

    setErrorMsg(null);
    setLastFailedPrompt(null);

    const nextMessages: ChatMessage[] = isRetry
      ? messages
      : [
          ...messages,
          {
            id: `u-${Date.now()}`,
            role: 'user',
            text: trimmed,
          },
        ];

    if (!isRetry) {
      setMessages(nextMessages);
      setInput('');
    }
    setIsSending(true);

    try {
      const apiMessages = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/help-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language,
          currentView,
          isAdmin: isOwnerAdmin,
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.reply as string,
        },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to reach Help Bot.';
      setErrorMsg(message);
      setLastFailedPrompt(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendQuestion(input);
  };

  const handleResetChat = () => {
    setMessages([{ id: 'welcome', role: 'assistant', text: t.botGreeting }]);
    setErrorMsg(null);
    setLastFailedPrompt(null);
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={t.botTitle}
            className="w-[340px] sm:w-[375px] max-h-[500px] flex flex-col bg-white dark:bg-[#07132A] border border-blue-200 dark:border-blue-800/80 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#F2F7FF] dark:bg-[#0A1A38] border-b border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-600/30 dark:bg-blue-500/15 dark:border-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xs font-semibold text-blue-950 dark:text-blue-50 truncate">
                    {t.botTitle}
                  </p>
                  <p className="text-[11px] text-blue-800/75 dark:text-blue-300/75 truncate">
                    {t.botSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title={t.botClear}
                  aria-label={t.botClear}
                  className="p-1.5 rounded-md text-blue-700 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-50 dark:hover:bg-blue-900/60 transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.botCloseAria}
                  className="p-1.5 rounded-md text-blue-700 hover:text-blue-950 hover:bg-blue-100 dark:text-blue-300 dark:hover:text-blue-50 dark:hover:bg-blue-900/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-[240px] max-h-[310px] bg-[#F8FBFF] dark:bg-[#051024]">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-start gap-2 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isUser
                          ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300'
                      }`}
                    >
                      {isUser ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950 font-medium'
                          : 'bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-900/80 text-blue-950 dark:text-blue-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/70 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-900/80 inline-flex items-center gap-2">
                    <span>{t.botThinking}</span>
                    <span className="inline-flex gap-1">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                      />
                    </span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-700 dark:text-red-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="break-words">{errorMsg}</p>
                  </div>
                  {lastFailedPrompt && (
                    <button
                      type="button"
                      onClick={() => void sendQuestion(lastFailedPrompt, true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t.botRetry}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Quick Suggestions on first turn */}
              {messages.length <= 1 && !isSending && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {t.botQuickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendQuestion(prompt)}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-[#EAF2FF] hover:bg-blue-100 dark:bg-[#0A1A38] dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <div ref={listEndRef} />
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="p-2.5 bg-white dark:bg-[#07132A] border-t border-blue-200 dark:border-blue-800/80 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.botPlaceholder}
                maxLength={1000}
                disabled={isSending}
                className="flex-1 bg-[#F2F7FF] dark:bg-[#051024] border border-blue-200 dark:border-blue-800/80 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-blue-950 dark:text-blue-50 placeholder:text-blue-600/50 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                aria-label={t.botSend}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.botSend}</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chatbot Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        type="button"
        onClick={onToggleOpen}
        aria-label={isOpen ? t.botCloseAria : t.botOpenAria}
        aria-expanded={isOpen}
        title={t.botTitle}
        className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white dark:text-slate-950 shadow-lg border border-blue-500/40 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
      </motion.button>
    </div>
  );
};
