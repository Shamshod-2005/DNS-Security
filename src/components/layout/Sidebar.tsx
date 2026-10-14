import {
  Activity,
  Filter,
  LayoutDashboard,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Server,
  ShieldAlert,
  ShieldCheck,
  User,
  Wifi,
} from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type NavTab =
  | "dashboard"
  | "querylog"
  | "dot"
  | "blocked"
  | "filter"
  | "pcap"
  | "account";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const { t } = useTranslation();

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onToggleCollapse]);

  // Exactly the 7 pages from the original backend (dev_backend / QOLLANMA)
  const navItems = [
    {
      id: "dashboard" as NavTab,
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
    },
    {
      id: "querylog" as NavTab,
      label: t("nav.querylog"),
      icon: Activity,
    },
    {
      id: "dot" as NavTab,
      label: t("nav.dot"),
      icon: Lock,
    },
    {
      id: "blocked" as NavTab,
      label: t("nav.blocked"),
      icon: ShieldAlert,
    },
    {
      id: "filter" as NavTab,
      label: t("nav.filter"),
      icon: Filter,
    },
    {
      id: "pcap" as NavTab,
      label: t("nav.pcap"),
      icon: Wifi,
    },
    {
      id: "account" as NavTab,
      label: t("nav.account"),
      icon: User,
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0d1322] transition-all duration-300 ease-in-out z-30 shrink-0 select-none ${
        collapsed ? "w-[72px]" : "w-64 widescreen:w-72"
      }`}
    >
      {/* ─── Brand Header & Single Primary Toggle ─── */}
      <div className="h-16 widescreen:h-20 flex items-center border-b border-slate-200 dark:border-slate-800/70 px-3.5 widescreen:px-5">
        {!collapsed ? (
          <div className="w-full flex items-center justify-between">
            <div
              className="flex items-center gap-3 overflow-hidden cursor-pointer group"
              onClick={() => onSelectTab("dashboard")}
            >
              <div className="w-9 h-9 widescreen:w-10 widescreen:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 ring-1 ring-blue-400/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 widescreen:w-6 widescreen:h-6 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm widescreen:text-base tracking-wide text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-mono">
                  MALICIOUS<span className="text-blue-500 dark:text-blue-400">DNS</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Security Shield
                </span>
              </div>
            </div>

            {/* Single primary collapse button in expanded header */}
            <button
              onClick={onToggleCollapse}
              id="sidebar-collapse-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Collapse sidebar (Ctrl+B)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Collapsed state: Centered interactive Logo with hover morph to expand */
          <div className="w-full flex items-center justify-center">
            <button
              onClick={onToggleCollapse}
              id="sidebar-expand-btn"
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 ring-1 ring-blue-400/30 text-white hover:scale-105 active:scale-95 transition-all group relative cursor-pointer"
              title="Expand sidebar (Ctrl+B)"
            >
              <ShieldCheck className="w-5 h-5 transition-all duration-200 group-hover:opacity-0 group-hover:scale-75 absolute" />
              <PanelLeftOpen className="w-5 h-5 transition-all duration-200 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100" />

              {/* Flyout tooltip for collapsed header button */}
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-mono shadow-xl border border-slate-700/80 pointer-events-none hidden group-hover:flex items-center z-50 whitespace-nowrap">
                <span>Expand sidebar (Ctrl+B)</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ─── Navigation List ─── */}
      <nav className={`flex-1 px-2.5 py-3.5 space-y-1.5 ${collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (collapsed) {
            return (
              <div key={item.id} className="relative group/item flex justify-center">
                <button
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover/item:scale-110" />
                </button>

                {/* Sleek Flyout Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-mono whitespace-nowrap shadow-xl border border-slate-700/80 pointer-events-none hidden group-hover/item:flex items-center gap-1.5 z-50">
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 widescreen:px-4 py-2.5 widescreen:py-3.5 rounded-xl text-sm widescreen:text-base font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? "bg-blue-600/10 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              <Icon
                className={`w-5 h-5 widescreen:w-5.5 widescreen:h-5.5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ─── Node Status Footer (Clean without extra buttons) ─── */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/40">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 font-mono">
                  Edge Resolver
                </span>
              </div>
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-mono font-medium bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                11ms
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3 text-slate-500" /> Active
              </span>
              <span className="text-emerald-500 font-medium">100% Online</span>
            </div>
          </div>
        ) : (
          /* Collapsed state footer: Centered Server Status only */
          <div className="relative group/status flex justify-center py-1">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center relative cursor-default shadow-xs">
              <Server className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* Status flyout tooltip */}
            <div className="absolute left-full ml-3 bottom-0 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-mono shadow-xl border border-slate-700/80 pointer-events-none hidden group-hover/status:flex flex-col z-50 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">Edge Resolver (11ms)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                100% Online • Status: Active
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
