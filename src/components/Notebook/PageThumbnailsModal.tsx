import React from 'react';
import type { NotebookPage } from '../../types/notebook';
import { X, BookOpen, Presentation } from 'lucide-react';

interface PageThumbnailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: NotebookPage[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
}

export const PageThumbnailsModal: React.FC<PageThumbnailsModalProps> = ({
  isOpen,
  onClose,
  pages,
  currentPageIndex,
  onSelectPage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Índice & Miniaturas del Cuaderno</h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
              {pages.length} páginas
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid of Pages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {pages.map((page, index) => {
            const isCurrent = index === currentPageIndex;
            return (
              <div
                key={page.id}
                onClick={() => {
                  onSelectPage(index);
                  onClose();
                }}
                className={`group cursor-pointer rounded-xl border-2 transition-all p-2 flex flex-col relative bg-slate-950 ${
                  isCurrent
                    ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                }`}
              >
                {/* Mini Paper Preview Card */}
                <div className="w-full aspect-[3/4] rounded-lg bg-amber-50/90 text-slate-800 p-2.5 overflow-hidden flex flex-col shadow-inner relative select-none">
                  <div className="text-[10px] font-bold text-slate-900 truncate mb-1">
                    {page.title || 'Página sin título'}
                  </div>
                  <div className="text-[8px] text-amber-800/80 mb-2 font-mono">
                    {page.subject || 'General'}
                  </div>

                  {page.slideTitle && (
                    <div className="text-[8px] bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded flex items-center gap-0.5 mb-1.5 font-sans">
                      <Presentation className="w-2.5 h-2.5" />
                      <span className="truncate">{page.slideTitle}</span>
                    </div>
                  )}

                  {/* Lines preview */}
                  <div className="space-y-1 opacity-50 flex-1">
                    <div className="h-1 bg-slate-300 rounded w-full" />
                    <div className="h-1 bg-slate-300 rounded w-4/5" />
                    <div className="h-1 bg-slate-300 rounded w-3/4" />
                    <div className="h-1 bg-slate-300 rounded w-5/6" />
                  </div>

                  {/* Stickers preview indicator */}
                  {page.stickers && page.stickers.length > 0 && (
                    <div className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-xs bg-amber-300 shadow-xs border border-amber-400 rotate-6" />
                  )}

                  {/* Drawings indicator */}
                  {page.drawings && page.drawings.length > 0 && (
                    <div className="absolute bottom-2 left-2 text-[8px] font-bold text-blue-600">
                      ✏️
                    </div>
                  )}
                </div>

                {/* Footer badge */}
                <div className="mt-2 flex items-center justify-between text-xs px-1">
                  <span className={`font-mono font-semibold ${isCurrent ? 'text-amber-400' : 'text-slate-400'}`}>
                    Pág. {page.pageNumber}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full font-medium">
                      Actual
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
