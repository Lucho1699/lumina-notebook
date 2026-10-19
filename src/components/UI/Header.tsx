import React, { useState, useRef, useEffect } from 'react';
import type { ActiveTab } from '../../types/notebook';
import { useAuth } from '../../context/useAuth';
import {
  BookOpen,
  CalendarCheck,
  Mic,
  Presentation,
  Settings,
  Layers,
  LogIn,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingTasksCount: number;
  notebookCount?: number;
  activeNotebookTitle?: string;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  pendingTasksCount,
  notebookCount,
  activeNotebookTitle,
  onOpenSettings,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute user initial
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-3 md:px-6 py-2.5 flex items-center justify-between gap-3 shadow-lg z-50">
      {/* Brand logo & title */}
      <div
        className="flex items-center gap-2.5 cursor-pointer select-none"
        onClick={() => onSelectTab('notebook')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950">
          <BookOpen className="w-4 h-4 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base md:text-lg font-extrabold text-white tracking-tight flex items-center gap-1">
              <span>Lumina</span>
              <span className="text-amber-400 font-light">Notebook</span>
            </h1>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded hidden sm:inline">
              v1.0
            </span>
          </div>
          {activeNotebookTitle && (
            <div className="text-[11px] text-slate-400 truncate max-w-[200px] hidden lg:block">
              📓 {activeNotebookTitle}
            </div>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto">
        {/* Mis Cuadernos (Library) Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('library')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'library'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mis Cuadernos</span>
          {notebookCount !== undefined && notebookCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'library'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {notebookCount}
            </span>
          )}
        </button>

        {/* Notebook Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('notebook')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notebook'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Cuaderno 3D</span>
        </button>

        {/* Planner Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('planner')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer relative ${
            activeTab === 'planner'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Agenda</span>
          {pendingTasksCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'planner'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* Lecture Audio Recorder Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('recorder')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'recorder'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Grabador IA</span>
        </button>

        {/* Slide Ingestion Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('slides')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'slides'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>Diapositivas</span>
        </button>
      </nav>

      {/* Right Actions: User Profile / Auth + Settings */}
      <div className="flex items-center gap-2">
        {/* Local Auth Button / User Profile */}
        {isAuthenticated && user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer shadow-xs"
              title={`Sesión iniciada como ${user.name}`}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-slate-950 shadow-xs"
                style={{ backgroundColor: user.avatarColor || '#f59e0b' }}
              >
                {userInitial}
              </div>
              <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate hidden sm:inline">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400/90 font-mono">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Autenticación Local JWT</span>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Configuración & Copias</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-2 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Iniciar sesión o registrar cuenta local"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </button>
        )}

        {/* Global Settings Modal Toggle */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors shadow-xs cursor-pointer"
          title="Configuración del cuaderno y copia de seguridad"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
