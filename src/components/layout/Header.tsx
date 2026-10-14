import {
  CheckCircle2,
  Globe,
  Laptop,
  LogOut,
  Maximize,
  Minimize,
  Moon,
  Search,
  Shield,
  Sun,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { getCurrentUser, logoutUser } from "../../api/auth";
import { ROUTES } from "../../router/routes";
import { useTheme } from "../../hooks/useTheme";
import type {
  BlockedDomainItem,
  ClientDevice,
  DnsLogEntry,
  NotificationItem,
} from "../../types";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { LogoutModal } from "../common/LogoutModal";

interface HeaderProps {
  onSearchSelect: (type: "domain" | "ip" | "client", value: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  liveStreaming: boolean;
  onToggleLiveStream: () => void;
  onOpenBlockModal: () => void;
  dnsLogs: DnsLogEntry[];
  blockedDomains: BlockedDomainItem[];
  clients: ClientDevice[];
}

export const Header: React.FC<HeaderProps> = ({
  onSearchSelect,

  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  liveStreaming,
  onToggleLiveStream,
  onOpenBlockModal,
  dnsLogs,
  blockedDomains,
  clients,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Fullscreen o'zgarishini kuzatish
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Joriy autentifikatsiyadan o'tgan foydalanuvchini olish
  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: 60 * 1000,
  });

  const rawUsername = user?.username || "Admin";
  // Display name: birinchi harfni katta qilib ko'rsatish (masalan: "admin" -> "Admin")
  const displayName =
    rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
  // Avatar initials: birinchi 2 ta harf (masalan: "AD")
  const initials = rawUsername.slice(0, 2).toUpperCase();

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await logoutUser();
  };

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter search results
  const matchingDomains = Array.from(
    new Set([
      ...dnsLogs.map((l) => l.domain),
      ...blockedDomains.map((b) => b.domain),
    ]),
  )
    .filter((d) => d.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 4);

  const matchingIps = Array.from(
    new Set([...dnsLogs.map((l) => l.clientIp), ...clients.map((c) => c.ip)]),
  )
    .filter((ip) => ip.includes(searchQuery))
    .slice(0, 3);

  const matchingClients = clients
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 3);

  const hasSearchResults =
    searchQuery.trim().length > 0 &&
    (matchingDomains.length > 0 ||
      matchingIps.length > 0 ||
      matchingClients.length > 0);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      id="main-header"
      className="h-16 widescreen:h-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0d1322]/90 backdrop-blur-md px-6 widescreen:px-10 flex items-center justify-between gap-4 sticky top-0 z-40 transition-colors"
    >
      {/* Search Bar with live quick-finder */}
      <div className="flex-1 max-w-xl widescreen:max-w-2xl relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 widescreen:w-5 widescreen:h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-dns-search"
            type="text"
            placeholder={t("header.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-10 pr-12 py-2 widescreen:py-2.5 bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-sm widescreen:text-base text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && hasSearchResults && (
          <div
            id="search-results-dropdown"
            className="absolute top-full left-0 right-0 mt-2 bg-white/98 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-md space-y-2 max-h-96 overflow-y-auto"
          >
            {matchingDomains.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1 font-mono">
                  <Globe className="w-3 h-3 text-blue-500 dark:text-blue-400" />{" "}
                  {t("header.matchingDomains")}
                </div>
                {matchingDomains.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => {
                      onSearchSelect("domain", domain);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-mono text-slate-700 dark:text-slate-200 flex items-center justify-between group"
                  >
                    <span>{domain}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Filter DNS Logs →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchingIps.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1 font-mono">
                  <Shield className="w-3 h-3 text-blue-500 dark:text-blue-400" />{" "}
                  {t("header.matchingIps")}
                </div>
                {matchingIps.map((ip) => (
                  <button
                    key={ip}
                    onClick={() => {
                      onSearchSelect("ip", ip);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-mono text-slate-700 dark:text-slate-200 flex items-center justify-between group"
                  >
                    <span>{ip}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Filter Telemetry →
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchingClients.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1 font-mono">
                  <Laptop className="w-3 h-3 text-blue-500 dark:text-blue-400" />{" "}
                  Devices
                </div>
                {matchingClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      onSearchSelect("client", client.name);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-600 dark:text-blue-300">
                        {client.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        ({client.department})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {client.ip} →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Language Switcher (UZ / RU / EN) */}
        <LanguageSwitcher />

        {/* Fullscreen (TV / Video Wall Kiosk Mode) Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          id="fullscreen-toggle-btn"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs cursor-pointer group"
          title={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekran rejimi (Fullscreen)"}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-blue-500 transition-transform group-hover:scale-110" />
          ) : (
            <Maximize className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs cursor-pointer group"
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
          aria-label="Toggle theme mode"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-blue-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* User Profile / Administrator Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            id="user-profile-menu-btn"
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold ring-1 ring-blue-400/40 shadow-sm shadow-blue-500/20 font-mono">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Administrator
              </div>
            </div>
          </button>

          {isProfileOpen && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-56 bg-white/98 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-md"
            >
              <div className="p-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold font-mono shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      @{rawUsername}
                    </p>
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> Super Administrator
                </div>
              </div>

              <div className="pt-1.5 space-y-0.5">
                <Link
                  to={ROUTES.ACCOUNT}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span className="font-medium text-xs">
                    {t("nav.account") || "Profil sozlamalari"}
                  </span>
                </Link>

                <button
                  type="button"
                  id="profile-logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-2 cursor-pointer transition-colors group"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 transition-transform group-hover:translate-x-0.5" />
                  <span className="font-semibold text-xs">
                    {t("header.logout")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-step Security Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </header>
  );
};
