import React from 'react';
import type { ActiveTab } from '../../types/notebook';
import { BookOpen, CalendarCheck, Mic, Layers, Camera } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/haptics';

interface MobileNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingTasksCount: number;
  notebookCount?: number;
  onOpenQuickCamera?: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onSelectTab,
  pendingTasksCount,
  notebookCount,
  onOpenQuickCamera,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    triggerHapticFeedback('light');
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl md:hidden safe-area-bottom">
      {/* 1. Mis Cuadernos */}
      <button
        type="button"
        onClick={() => handleTabClick('library')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
          activeTab === 'library'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Layers className="w-5 h-5" />
          {notebookCount !== undefined && notebookCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-mono font-bold bg-amber-500 text-slate-950 rounded-full">
              {notebookCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Cuadernos</span>
      </button>

      {/* 2. Cuaderno 3D */}
      <button
        type="button"
        onClick={() => handleTabClick('notebook')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
          activeTab === 'notebook'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight">Cuaderno</span>
      </button>

      {/* 3. Botón Central Rápido de Cámara */}
      {onOpenQuickCamera && (
        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('medium');
            onOpenQuickCamera();
          }}
          className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 w-11 h-11 rounded-full shadow-lg shadow-amber-500/30 border-2 border-slate-900 active:scale-95 transition-transform"
          title="Capturar foto con cámara"
        >
          <Camera className="w-5 h-5 font-bold" />
        </button>
      )}

      {/* 4. Agenda */}
      <button
        type="button"
        onClick={() => handleTabClick('planner')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
          activeTab === 'planner'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <CalendarCheck className="w-5 h-5" />
          {pendingTasksCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-mono font-bold bg-amber-500 text-slate-950 rounded-full">
              {pendingTasksCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Agenda</span>
      </button>

      {/* 5. Grabador IA */}
      <button
        type="button"
        onClick={() => handleTabClick('recorder')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
          activeTab === 'recorder'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Mic className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight">Grabador</span>
      </button>
    </nav>
  );
};
