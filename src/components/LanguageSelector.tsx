import React from 'react';
import { Globe } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../i18n/translations';
import { SupportedLanguage } from '../types/reelsync';

interface LanguageSelectorProps {
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  ariaLabel?: string;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onChangeLanguage,
  ariaLabel = 'Select language',
  compact = false,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#EAF2FF] dark:bg-[#0A1A38] border border-blue-200 dark:border-blue-800/80 hover:border-blue-400 transition-colors shrink-0">
      <Globe className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
      <select
        aria-label={ariaLabel}
        value={language}
        onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
        className={`bg-transparent text-xs font-medium text-blue-950 dark:text-blue-50 focus:outline-none cursor-pointer ${
          compact ? 'max-w-[96px]' : 'max-w-[130px]'
        }`}
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option
            key={opt.code}
            value={opt.code}
            className="bg-white dark:bg-[#07132A] text-blue-950 dark:text-blue-50"
          >
            {opt.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
};
