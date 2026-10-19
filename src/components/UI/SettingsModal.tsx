import React, { useRef } from 'react';
import type { NotebookSettings, CoverStyle, PaperTexture } from '../../types/notebook';
import {
  X,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Palette,
  RotateCcw,
  Download,
  Upload,
  BookOpen,
  Smartphone,
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import { usePwaInstall } from '../../utils/usePwaInstall';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotebookSettings;
  onUpdateSettings: (settings: NotebookSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
}

const COVER_OPTIONS: { id: CoverStyle; label: string; bg: string; border: string }[] = [
  { id: 'leather', label: 'Cuero Clásico', bg: 'bg-[#3b271d]', border: 'border-amber-700' },
  { id: 'navy', label: 'Azul Marino', bg: 'bg-[#0f172a]', border: 'border-sky-700' },
  { id: 'emerald', label: 'Verde Esmeralda', bg: 'bg-[#064e3b]', border: 'border-emerald-600' },
  { id: 'amber', label: 'Ámbar Cálido', bg: 'bg-[#78350f]', border: 'border-amber-600' },
  { id: 'obsidian', label: 'Obsidiana Mate', bg: 'bg-[#18181b]', border: 'border-zinc-700' },
];

const TEXTURE_OPTIONS: { id: PaperTexture; label: string }[] = [
  { id: 'ruled', label: 'Rayado Académico' },
  { id: 'grid', label: 'Cuadriculado Matemático' },
  { id: 'dotted', label: 'Puntos Bullet Journal' },
  { id: 'blank', label: 'Blanco Liso' },
  { id: 'vintage', label: 'Vintage Sepia' },
  { id: 'dark', label: 'Pizarra Oscura' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { isInstallable, isInstalled, triggerInstall } = usePwaInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Configuración del Cuaderno</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Cover Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Estilo de Portada / Encuadernación</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COVER_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, coverStyle: c.id })}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all ${
                    settings.coverStyle === c.id
                      ? `${c.bg} ${c.border} text-white ring-2 ring-amber-400/50 shadow-md`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.bg} border border-white/40`} />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Paper Texture */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Estilo de Papel Predeterminado</span>
            </label>
            <select
              value={settings.defaultTexture}
              onChange={(e) =>
                onUpdateSettings({ ...settings, defaultTexture: e.target.value as any })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
            >
              {TEXTURE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sound & Spread Preferences */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Efectos de Sonido Táctil
                </span>
                <span className="text-[11px] text-slate-500">
                  Sonido realista de paso de página sintetizado en tiempo real
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const val = !settings.soundEnabled;
                  onUpdateSettings({ ...settings, soundEnabled: val });
                  soundEngine.enabled = val;
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  settings.soundEnabled
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Modo de Doble Cara (Cuaderno Abierto)
                </span>
                <span className="text-[11px] text-slate-500">
                  Muestra 2 páginas enfrentadas en pantallas de escritorio
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.dualPageMode}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, dualPageMode: e.target.checked })
                }
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* PWA / App Installation */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Instalación como App Móvil / PC
            </label>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Lumina Notebook en tu Pantalla</div>
                  <div className="text-[11px] text-slate-400">
                    {isInstalled
                      ? '✅ App instalada a pantalla completa en este dispositivo.'
                      : isInstallable
                      ? 'Listo para instalar como app sin barra del navegador.'
                      : 'En Chrome: menú de 3 puntos > "Instalar aplicación" / Pantalla de inicio.'}
                  </div>
                </div>
              </div>
              {isInstallable && (
                <button
                  type="button"
                  onClick={triggerInstall}
                  className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-colors shrink-0"
                >
                  Instalar
                </button>
              )}
            </div>
          </div>

          {/* Backup, Export & Reset */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Copia de Seguridad & Restauración
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Exportar Copia (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Restaurar Copia</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={onImportBackup}
                className="hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onResetData}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Restablecer Cuaderno a Datos Iniciales</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
