import React from 'react';
import {
  MousePointer,
  PenTool,
  Highlighter,
  Eraser,
  StickyNote,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  FileDown,
  LayoutGrid,
  Columns2,
  Square,
  Undo2,
  RotateCcw,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { PaperTexture, Notebook } from '../../types/notebook';
import { soundEngine } from '../../utils/soundEngine';

interface NotebookToolbarProps {
  currentPageIndex: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageIndex: number) => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  onAddSticker: () => void;
  activeTool: 'select' | 'pen' | 'highlighter' | 'eraser';
  onChangeTool: (tool: 'select' | 'pen' | 'highlighter' | 'eraser') => void;
  penColor: string;
  onChangePenColor: (color: string) => void;
  penWidth: number;
  onChangePenWidth: (width: number) => void;
  highlighterColor: string;
  onChangeHighlighterColor: (color: string) => void;
  currentTexture: PaperTexture;
  onChangeTexture: (texture: PaperTexture) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  dualPageMode: boolean;
  onToggleDualPage: () => void;
  onOpenThumbnails: () => void;
  onExportPDF: () => void;
  onUndoStroke?: () => void;
  onClearDrawings?: () => void;
  canUndo?: boolean;
  notebooks?: Notebook[];
  activeNotebookId?: string;
  onSelectNotebook?: (id: string) => void;
  onOpenLibrary?: () => void;
  onConvertToText?: () => void;
  isRecognizingHandwriting?: boolean;
  hasDrawings?: boolean;
}

const PEN_COLORS = [
  { name: 'Azul Tinta', hex: '#2563eb' },
  { name: 'Negro Grafito', hex: '#1e293b' },
  { name: 'Rojo Corrector', hex: '#dc2626' },
  { name: 'Verde Esmeralda', hex: '#059669' },
  { name: 'Púrpura', hex: '#9333ea' },
];

const HIGHLIGHTER_COLORS = [
  { name: 'Amarillo Neón', hex: '#facc15' },
  { name: 'Verde Menta', hex: '#4ade80' },
  { name: 'Cian Brillo', hex: '#38bdf8' },
  { name: 'Rosa Coral', hex: '#fb7185' },
  { name: 'Naranja Cítrico', hex: '#fb923c' },
];

const TEXTURE_OPTIONS: { id: PaperTexture; label: string; icon: string }[] = [
  { id: 'ruled', label: 'Rayado', icon: '📝' },
  { id: 'grid', label: 'Cuadriculado', icon: '📐' },
  { id: 'dotted', label: 'Puntos', icon: '⁖' },
  { id: 'blank', label: 'Blanco', icon: '📄' },
  { id: 'vintage', label: 'Vintage', icon: '📜' },
  { id: 'dark', label: 'Pizarra', icon: '🌑' },
];

export const NotebookToolbar: React.FC<NotebookToolbarProps> = ({
  currentPageIndex,
  totalPages,
  onPrevPage,
  onNextPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onAddSticker,
  activeTool,
  onChangeTool,
  penColor,
  onChangePenColor,
  penWidth,
  onChangePenWidth,
  highlighterColor,
  onChangeHighlighterColor,
  currentTexture,
  onChangeTexture,
  soundEnabled,
  onToggleSound,
  dualPageMode,
  onToggleDualPage,
  onOpenThumbnails,
  onExportPDF,
  onUndoStroke,
  onClearDrawings,
  canUndo = false,
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onOpenLibrary,
  onConvertToText,
  isRecognizingHandwriting = false,
  hasDrawings = false,
}) => {
  return (
    <div className="w-full bg-slate-900/95 border-b border-slate-800 px-3 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-200 backdrop-blur-md shadow-md z-40">
      {/* Left Section: Page Flipping, Counter & Notebook Switcher */}
      <div className="flex items-center gap-1.5 md:gap-3">
        <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60 shadow-xs">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPageIndex <= 0}
            className="p-1.5 rounded-md hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Página Anterior (Flecha Izquierda)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="px-2.5 text-xs font-mono font-medium text-amber-400 select-none">
            {currentPageIndex + 1} / {totalPages}
          </span>

          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPageIndex >= totalPages - 1}
            className="p-1.5 rounded-md hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Página Siguiente (Flecha Derecha)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnails Modal Trigger */}
        <button
          type="button"
          onClick={onOpenThumbnails}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-colors hidden sm:flex items-center gap-1 text-xs font-medium cursor-pointer"
          title="Ver índice de miniaturas"
        >
          <LayoutGrid className="w-4 h-4 text-amber-400" />
          <span>Índice</span>
        </button>

        {/* Spread toggle (2 pages vs 1 page) */}
        <button
          type="button"
          onClick={onToggleDualPage}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-colors hidden md:flex items-center gap-1 text-xs font-medium cursor-pointer"
          title={dualPageMode ? 'Cambiar a 1 página simple' : 'Cambiar a 2 páginas abiertas'}
        >
          {dualPageMode ? (
            <>
              <Columns2 className="w-4 h-4 text-sky-400" />
              <span>Doble Cara</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4 text-slate-400" />
              <span>1 Página</span>
            </>
          )}
        </button>

        {/* Quick Notebook Subject Dropdown */}
        {notebooks && notebooks.length > 0 && onSelectNotebook && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/60">
            <select
              value={activeNotebookId}
              onChange={(e) => onSelectNotebook(e.target.value)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs py-1.5 px-2.5 rounded-lg border border-slate-700/80 outline-none cursor-pointer max-w-[200px] truncate"
              title="Cambiar de cuaderno / materia"
            >
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id} className="bg-slate-900 text-slate-200">
                  📓 {nb.title} ({nb.subject})
                </option>
              ))}
            </select>

            {onOpenLibrary && (
              <button
                type="button"
                onClick={onOpenLibrary}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hidden sm:flex items-center gap-1 text-xs font-medium cursor-pointer"
                title="Ver todos mis cuadernos (Estantería)"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Estantería</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Middle Section: Drawing & Inking Tools */}
      <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/70 shadow-inner">
        {/* Pointer / Select tool */}
        <button
          type="button"
          onClick={() => onChangeTool('select')}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            activeTool === 'select'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
          }`}
          title="Modo Selección / Escribir texto / Arrastrar páginas"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Pen Tool */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => onChangeTool('pen')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
            title="Pluma de Dibujo"
          >
            <PenTool className="w-4 h-4" />
          </button>
          {activeTool === 'pen' && (
            <div className="flex items-center gap-1.5 px-2 ml-1 border-l border-slate-700">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onChangePenColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    penColor === c.hex
                      ? 'scale-125 border-white shadow-xs'
                      : 'border-slate-600 hover:scale-110'
                  }`}
                  title={c.name}
                />
              ))}

              {/* Stroke Width Selector */}
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
                {[2, 4, 8].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChangePenWidth(w)}
                    className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer ${
                      penWidth === w ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={`Grosor: ${w}px`}
                  >
                    <div
                      className="rounded-full bg-current"
                      style={{ width: `${w + 1}px`, height: `${w + 1}px` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlighter Tool */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => onChangeTool('highlighter')}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              activeTool === 'highlighter'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
            title="Resaltador Fluor"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          {activeTool === 'highlighter' && (
            <div className="flex items-center gap-1 px-1.5 ml-1 border-l border-slate-700">
              {HIGHLIGHTER_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onChangeHighlighterColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    highlighterColor === c.hex
                      ? 'scale-125 border-white shadow-xs'
                      : 'border-slate-600 hover:scale-110'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Eraser Tool */}
        <button
          type="button"
          onClick={() => onChangeTool('eraser')}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            activeTool === 'eraser'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
          }`}
          title="Borrador de Tinta"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Undo Stroke Button */}
        {onUndoStroke && (
          <button
            type="button"
            onClick={onUndoStroke}
            disabled={!canUndo}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Deshacer último trazo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}

        {/* Clear Page Drawings Button */}
        {onClearDrawings && (
          <button
            type="button"
            onClick={onClearDrawings}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Limpiar todos los dibujos de la hoja"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Convert Handwriting / Stylus to Text */}
        {onConvertToText && (
          <button
            type="button"
            onClick={onConvertToText}
            disabled={!hasDrawings || isRecognizingHandwriting}
            className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isRecognizingHandwriting
                ? 'bg-amber-500/30 text-amber-300 animate-pulse border border-amber-500/50'
                : hasDrawings
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent'
            }`}
            title={
              hasDrawings
                ? 'Convertir tus trazos manuscritos con lápiz/pluma a texto digital'
                : 'Dibuja o escribe con tu lápiz primero para convertir a texto'
            }
          >
            <Sparkles className={`w-4 h-4 ${isRecognizingHandwriting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isRecognizingHandwriting ? 'Reconociendo...' : 'A Texto'}
            </span>
          </button>
        )}

        {/* Add Post-It */}
        <button
          type="button"
          onClick={() => {
            onAddSticker();
            soundEngine.playStickerSound();
          }}
          className="p-2 rounded-lg text-amber-400 hover:bg-slate-700/60 hover:text-amber-300 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
          title="Añadir Nota Adhesiva (Post-It)"
        >
          <StickyNote className="w-4 h-4" />
          <span className="hidden lg:inline">+ Post-It</span>
        </button>
      </div>

      {/* Right Section: Texture, New Page & Export */}
      <div className="flex items-center gap-2">
        {/* Paper Texture selector */}
        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700/60 text-xs">
          {TEXTURE_OPTIONS.map((tex) => (
            <button
              key={tex.id}
              type="button"
              onClick={() => onChangeTexture(tex.id)}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                currentTexture === tex.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Estilo de hoja: ${tex.label}`}
            >
              <span>{tex.icon}</span>
              <span className="hidden xl:inline ml-1">{tex.label}</span>
            </button>
          ))}
        </div>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
          }`}
          title={soundEnabled ? 'Sonido de hojas activado' : 'Sonido silenciado'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Add New Page */}
        <button
          type="button"
          onClick={onAddPage}
          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          title="Añadir nueva hoja al cuaderno"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Hoja</span>
        </button>

        {/* Duplicate Page */}
        <button
          type="button"
          onClick={onDuplicatePage}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors hidden sm:flex cursor-pointer"
          title="Duplicar página actual"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Delete Page */}
        <button
          type="button"
          onClick={onDeletePage}
          disabled={totalPages <= 1}
          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400 border border-slate-700/60 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Eliminar página actual"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Export PDF */}
        <button
          type="button"
          onClick={onExportPDF}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          title="Descargar Cuaderno en PDF"
        >
          <FileDown className="w-4 h-4" />
          <span className="hidden sm:inline">PDF</span>
        </button>
      </div>
    </div>
  );
};
