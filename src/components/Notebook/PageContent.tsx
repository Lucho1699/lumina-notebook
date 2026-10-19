import React, { useState, useEffect, useRef } from 'react';
import type { NotebookPage, DrawingStroke, StickerItem } from '../../types/notebook';
import { InkingCanvas } from './InkingCanvas';
import { StickerLayer } from './StickerLayer';
import {
  Presentation,
  Edit3,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  CheckSquare,
  Sparkles,
  Highlighter as HighlighterIcon,
  Type,
  RemoveFormatting,
} from 'lucide-react';

interface PageContentProps {
  page: NotebookPage;
  side: 'left' | 'right' | 'single';
  isCurrentPage: boolean;
  activeTool: 'select' | 'pen' | 'highlighter' | 'eraser';
  penColor: string;
  penWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
  onUpdatePage: (updated: Partial<NotebookPage>) => void;
  onFlipNext?: () => void;
  onFlipPrev?: () => void;
}

export const PageContent: React.FC<PageContentProps> = ({
  page,
  side,
  isCurrentPage,
  activeTool,
  penColor,
  penWidth,
  highlighterColor,
  highlighterWidth,
  onUpdatePage,
  onFlipNext,
  onFlipPrev,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const prevPageIdRef = useRef(page.id);

  // Sync editor content with current page without causing cursor jumps during active typing
  useEffect(() => {
    if (!editorRef.current) return;

    if (prevPageIdRef.current !== page.id) {
      prevPageIdRef.current = page.id;
      editorRef.current.innerHTML = page.content || '';
      setIsEditingTitle(false);
      return;
    }

    // Only update innerHTML from prop if the user is not actively typing inside this editor
    if (document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== (page.content || '')) {
        editorRef.current.innerHTML = page.content || '';
      }
    }
  }, [page.id, page.content]);

  const textureClass =
    {
      ruled: 'paper-ruled',
      grid: 'paper-grid',
      dotted: 'paper-dotted',
      blank: 'paper-blank',
      vintage: 'paper-vintage',
      dark: 'paper-dark',
    }[page.texture] || 'paper-ruled';

  const spineShadowClass =
    side === 'left'
      ? 'page-shadow-left border-r border-amber-900/10'
      : side === 'right'
      ? 'page-shadow-right border-l border-amber-900/10'
      : 'shadow-md';

  const handleInput = () => {
    if (!editorRef.current) return;
    onUpdatePage({ content: editorRef.current.innerHTML });
  };

  const handleBlur = () => {
    if (!editorRef.current) return;
    onUpdatePage({ content: editorRef.current.innerHTML });
  };

  const handleStrokesUpdate = (newStrokes: DrawingStroke[]) => {
    onUpdatePage({ drawings: newStrokes });
  };

  const handleStickersUpdate = (newStickers: StickerItem[]) => {
    onUpdatePage({ stickers: newStickers });
  };

  // Pure WYSIWYG formatting commands (zero raw HTML displayed to the user)
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onUpdatePage({ content: editorRef.current.innerHTML });
    }
  };

  const handleHighlight = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const success = document.execCommand('hiliteColor', false, '#fef08a');
    if (!success) {
      document.execCommand('backColor', false, '#fef08a');
    }
    if (editorRef.current) {
      onUpdatePage({ content: editorRef.current.innerHTML });
    }
  };

  const handleInsertCallout = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || 'Escribe aquí tu nota clave o conclusión...';
    document.execCommand(
      'insertHTML',
      false,
      `<blockquote><strong>💡 Nota Clave:</strong> ${selectedText}</blockquote><p><br/></p>`
    );
    if (editorRef.current) {
      onUpdatePage({ content: editorRef.current.innerHTML });
    }
  };

  const handleInsertCheckbox = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(
      'insertHTML',
      false,
      `<p>◻️ Nueva tarea o apunte de clase...</p>`
    );
    if (editorRef.current) {
      onUpdatePage({ content: editorRef.current.innerHTML });
    }
  };

  // Plain-text paste handler: prevents ugly raw external HTML styles and scripts
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      document.execCommand('insertText', false, text);
      if (editorRef.current) {
        onUpdatePage({ content: editorRef.current.innerHTML });
      }
    }
  };

  return (
    <div
      className={`relative w-full h-full ${textureClass} ${spineShadowClass} overflow-hidden flex flex-col select-text`}
      style={{ minHeight: '100%' }}
    >
      {/* Red margin line on ruled paper */}
      {page.texture === 'ruled' && (
        <div className="absolute top-0 bottom-0 left-12 w-[1.5px] bg-red-300 pointer-events-none z-10 opacity-70" />
      )}

      {/* Top Header of Page */}
      <div className="relative z-10 px-6 pt-5 pb-2.5 border-b border-black/5 flex items-center justify-between gap-3 bg-white/25 backdrop-blur-2xs">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={page.title}
                onChange={(e) => onUpdatePage({ title: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="w-full text-base font-semibold text-slate-800 bg-white/85 px-2.5 py-0.5 rounded border border-amber-400 outline-none shadow-inner"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="p-1 rounded bg-amber-500 text-white hover:bg-amber-600 cursor-pointer shadow-xs"
                title="Confirmar título"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="group flex items-center gap-2 cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
              title="Haz clic para editar el título de la página"
            >
              <h3 className="text-base font-semibold text-slate-800 truncate">
                {page.title || 'Página sin título'}
              </h3>
              <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-medium text-amber-700/80 bg-amber-100/60 px-2 py-0.5 rounded-full inline-block">
              {page.subject || 'General'}
            </span>
            {page.slideTitle && (
              <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Presentation className="w-3 h-3" /> Diapositiva
              </span>
            )}
            {page.audioRecordingId && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                🎙️ Audio Vinculado
              </span>
            )}
          </div>
        </div>

        {/* Page Number & Font toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onUpdatePage({ handwritingFont: !page.handwritingFont })}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              page.handwritingFont
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'bg-white/50 border-slate-200 text-slate-600 hover:bg-white'
            }`}
            title="Cambiar entre fuente manuscrita y de molde"
          >
            {page.handwritingFont ? '✍️ Manuscrita' : '🔤 Imprenta'}
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-900/5 border border-slate-900/10 flex items-center justify-center font-mono text-xs font-bold text-slate-700 shadow-2xs">
            {page.pageNumber}
          </div>
        </div>
      </div>

      {/* Slide / PDF Attached Banner (if present) */}
      {page.slideTitle && (
        <div className="relative z-10 mx-6 mt-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs mb-1.5">
            <Presentation className="w-4 h-4 text-indigo-600" />
            <span>{page.slideTitle}</span>
          </div>
          {page.slideImage && (
            <div className="mb-2 max-h-36 overflow-hidden rounded border border-indigo-200/50 bg-white shadow-inner flex items-center justify-center">
              <img
                src={page.slideImage}
                alt={page.slideTitle}
                className="max-h-36 w-auto object-contain"
              />
            </div>
          )}
          {page.slideNotes && page.slideNotes.length > 0 && (
            <ul className="text-xs text-indigo-950/80 space-y-1 list-disc pl-4 font-sans">
              {page.slideNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Clean WYSIWYG Text Formatting Bar (Only in Select / Text Mode) */}
      {activeTool === 'select' && (
        <div className="page-format-toolbar relative z-10 px-6 py-1.5 bg-amber-50/70 border-b border-amber-200/50 flex items-center gap-1 flex-wrap text-slate-700 select-none">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('bold');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-700 cursor-pointer"
            title="Negrita (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('italic');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-700 cursor-pointer"
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('underline');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-700 cursor-pointer"
            title="Subrayado (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleHighlight();
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-amber-700 cursor-pointer flex items-center gap-0.5"
            title="Resaltar texto"
          >
            <HighlighterIcon className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-amber-300/60 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('formatBlock', '<h3>');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-700 cursor-pointer"
            title="Título de Sección"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('formatBlock', '<p>');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-700 cursor-pointer"
            title="Párrafo normal"
          >
            <Type className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertUnorderedList');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-700 cursor-pointer"
            title="Lista con viñetas"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertOrderedList');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-700 cursor-pointer"
            title="Lista numerada"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-amber-300/60 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertCallout();
            }}
            className="px-1.5 py-0.5 hover:bg-amber-200/80 rounded transition-colors text-amber-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            title="Insertar Nota Destacada"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Nota Clave</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleInsertCheckbox();
            }}
            className="px-1.5 py-0.5 hover:bg-amber-200/80 rounded transition-colors text-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            title="Insertar Casilla de Tarea"
          >
            <CheckSquare className="w-3 h-3 text-emerald-600" />
            <span>Casilla</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('removeFormat');
            }}
            className="p-1 hover:bg-amber-200/80 rounded transition-colors text-slate-400 hover:text-slate-600 ml-auto cursor-pointer"
            title="Limpiar formato del texto seleccionado"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Page Note Body (Direct Keyboard Writing Surface) */}
      <div
        onClick={(e) => {
          if (activeTool === 'select' && editorRef.current) {
            const target = e.target as HTMLElement;
            if (e.target === e.currentTarget || !target.closest('.page-note-editable')) {
              editorRef.current.focus();
              const sel = window.getSelection();
              if (sel) {
                const range = document.createRange();
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            }
          }
        }}
        className={`page-text-content relative z-10 flex-1 px-8 py-4 overflow-y-auto ${
          activeTool === 'select' ? 'cursor-text' : 'cursor-default'
        }`}
      >
        <div
          ref={editorRef}
          contentEditable={activeTool === 'select'}
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleBlur}
          onPaste={handlePaste}
          data-placeholder="Haz clic aquí para escribir tus apuntes con el teclado..."
          data-empty={!page.content || page.content.trim() === '' || page.content === '<p><br></p>' || page.content === '<p></p>'}
          className={`page-note-editable w-full min-h-[460px] h-full outline-none text-slate-800 leading-relaxed transition-colors select-text ${
            activeTool === 'select' ? 'cursor-text' : 'cursor-default pointer-events-none'
          } ${page.handwritingFont ? "font-['Caveat',cursive] text-2xl" : 'font-sans text-sm'}`}
        />
      </div>

      {/* Digital Drawing Canvas Overlay */}
      <InkingCanvas
        pageId={page.id}
        drawings={page.drawings || []}
        activeTool={activeTool}
        penColor={penColor}
        penWidth={penWidth}
        highlighterColor={highlighterColor}
        highlighterWidth={highlighterWidth}
        onUpdateDrawings={handleStrokesUpdate}
        isCurrentPage={isCurrentPage}
      />

      {/* Sticky Notes & Post-Its Layer */}
      <StickerLayer
        stickers={page.stickers || []}
        onUpdateStickers={handleStickersUpdate}
        isInteractive={activeTool === 'select'}
      />

      {/* Bottom Corner 3D Page Curl Flip Triggers */}
      {(side === 'right' || side === 'single') && onFlipNext && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onFlipNext();
          }}
          className="corner-curl-br group"
          title="Pasar a la siguiente página (Girar hoja en 3D)"
        >
          <div className="absolute bottom-1.5 right-1.5 text-[9px] text-amber-900/80 font-extrabold select-none">
            ▶
          </div>
        </div>
      )}

      {(side === 'left' || side === 'single') && onFlipPrev && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onFlipPrev();
          }}
          className="corner-curl-bl group"
          title="Volver a la página anterior (Girar hoja en 3D)"
        >
          <div className="absolute bottom-1.5 left-1.5 text-[9px] text-amber-900/80 font-extrabold select-none">
            ◀
          </div>
        </div>
      )}
    </div>
  );
};
