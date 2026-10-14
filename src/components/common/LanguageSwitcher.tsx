import { Check, ChevronDown, Globe } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "../../i18n";

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize language code to 2 letters (e.g. 'uz-UZ' -> 'uz')
  const currentLangCode = (i18n.language || "uz").split("-")[0] as SupportedLanguage;
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) ||
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Modern Trigger Button */}
      <button
        type="button"
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-mono text-xs shadow-xs select-none ${
          isOpen
            ? "bg-blue-50 dark:bg-blue-500/15 border-blue-400 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20"
            : "bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800/90 text-slate-700 dark:text-slate-200"
        }`}
        title="Tilni tanlash / Change Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-blue-500 transition-transform group-hover:rotate-12 duration-200" />
        <span className="font-bold tracking-wider">{currentLang.short}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen
              ? "rotate-180 text-blue-500"
              : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
          }`}
        />
      </button>

      {/* Modern Popover Menu */}
      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-2 w-48 bg-white/98 dark:bg-[#0f172a]/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <Globe className="w-3 h-3 text-blue-500" />
            <span>{t("common.language")}</span>
          </div>

          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-5 rounded-md text-[10px] font-bold font-mono flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    >
                      {lang.short}
                    </span>
                    <span className="text-xs font-medium tracking-tight">
                      {lang.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
