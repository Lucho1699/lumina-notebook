import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { NotebookPage, CoverStyle } from '../../types/notebook';
import { PageContent } from './PageContent';
import { soundEngine } from '../../utils/soundEngine';
import { triggerHapticFeedback } from '../../utils/haptics';

interface BookContainerProps {
  pages: NotebookPage[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  dualPageMode: boolean;
  coverStyle: CoverStyle;
  activeTool: 'select' | 'pen' | 'highlighter' | 'eraser';
  penColor: string;
  penWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
  onUpdatePage: (pageId: string, updated: Partial<NotebookPage>) => void;
}

const COVER_STYLES: Record<CoverStyle, { border: string; bg: string; accent: string; spine: string }> = {
  leather: {
    border: 'border-[#3d271d]',
    bg: 'bg-gradient-to-r from-[#2c1d15] via-[#3b271d] to-[#2c1d15]',
    accent: 'border-amber-600/40',
    spine: 'bg-gradient-to-r from-[#1f130d] via-[#332017] to-[#1f130d]',
  },
  navy: {
    border: 'border-[#1e293b]',
    bg: 'bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    accent: 'border-sky-500/40',
    spine: 'bg-gradient-to-r from-[#020617] via-[#0f172a] to-[#020617]',
  },
  emerald: {
    border: 'border-[#064e3b]',
    bg: 'bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#022c22]',
    accent: 'border-emerald-500/40',
    spine: 'bg-gradient-to-r from-[#022018] via-[#043d2e] to-[#022018]',
  },
  amber: {
    border: 'border-[#78350f]',
    bg: 'bg-gradient-to-r from-[#451a03] via-[#78350f] to-[#451a03]',
    accent: 'border-amber-500/40',
    spine: 'bg-gradient-to-r from-[#291002] via-[#542407] to-[#291002]',
  },
  obsidian: {
    border: 'border-[#18181b]',
    bg: 'bg-gradient-to-r from-[#09090b] via-[#18181b] to-[#09090b]',
    accent: 'border-zinc-500/40',
    spine: 'bg-gradient-to-r from-[#050505] via-[#121215] to-[#050505]',
  },
};

export const BookContainer: React.FC<BookContainerProps> = ({
  pages,
  currentPageIndex,
  onPageChange,
  dualPageMode,
  coverStyle,
  activeTool,
  penColor,
  penWidth,
  highlighterColor,
  highlighterWidth,
  onUpdatePage,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);

  // Flip state & animations
  const [isFlippingForward, setIsFlippingForward] = useState(false);
  const [isFlippingBackward, setIsFlippingBackward] = useState(false);

  // Interactive mouse drag on PC & touch swipe on mobile
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [dragSide, setDragSide] = useState<'right' | 'left' | null>(null);
  const [bookHalfWidth, setBookHalfWidth] = useState(400);

  // Normalized dual page indexing (always even index for left page)
  const normalizedIndex = dualPageMode
    ? Math.floor(currentPageIndex / 2) * 2
    : currentPageIndex;

  const leftPage = dualPageMode ? pages[normalizedIndex] : pages[currentPageIndex];
  const rightPage = dualPageMode ? pages[normalizedIndex + 1] : null;

  const canGoPrev = currentPageIndex > 0;
  const canGoNext = dualPageMode
    ? normalizedIndex + 2 < pages.length || (pages.length % 2 !== 0 && normalizedIndex + 1 < pages.length)
    : currentPageIndex < pages.length - 1;

  // Complete page forward turn
  const handleFlipNext = useCallback(() => {
    if (!canGoNext || isFlippingForward || isFlippingBackward) return;
    setIsFlippingForward(true);
    soundEngine.playPageFlip();
    triggerHapticFeedback('light');

    setTimeout(() => {
      if (dualPageMode) {
        onPageChange(Math.min(pages.length - 1, normalizedIndex + 2));
      } else {
        onPageChange(Math.min(pages.length - 1, currentPageIndex + 1));
      }
      setIsFlippingForward(false);
    }, 420);
  }, [canGoNext, isFlippingForward, isFlippingBackward, dualPageMode, pages.length, normalizedIndex, currentPageIndex, onPageChange]);

  // Complete page backward turn
  const handleFlipPrev = useCallback(() => {
    if (!canGoPrev || isFlippingForward || isFlippingBackward) return;
    setIsFlippingBackward(true);
    soundEngine.playPageFlip();
    triggerHapticFeedback('light');

    setTimeout(() => {
      if (dualPageMode) {
        onPageChange(Math.max(0, normalizedIndex - 2));
      } else {
        onPageChange(Math.max(0, currentPageIndex - 1));
      }
      setIsFlippingBackward(false);
    }, 420);
  }, [canGoPrev, isFlippingForward, isFlippingBackward, dualPageMode, normalizedIndex, currentPageIndex, onPageChange]);

  // Keyboard navigation (ArrowLeft, ArrowRight, PageUp, PageDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest('[contenteditable="true"]'))
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleFlipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handleFlipPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlipNext, handleFlipPrev]);

  // Pointer drag event handlers (Mouse on PC, Touch on Mobile)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag-turn pages when in 'select' mode so drawing tools have full canvas control
    if (activeTool !== 'select' || isFlippingForward || isFlippingBackward) return;

    // Check if click was inside an interactive, editable, or text page element
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a') ||
      target.closest('[contenteditable="true"]') ||
      target.closest('.page-note-editable') ||
      target.closest('.page-text-content') ||
      target.closest('.page-format-toolbar') ||
      target.closest('.sticker-item') ||
      target.closest('.corner-curl-br') ||
      target.closest('.corner-curl-bl') ||
      (e.pointerType === 'mouse' && target.closest('.select-text'))
    ) {
      return;
    }

    const rect = bookRef.current?.getBoundingClientRect();
    if (!rect) return;

    setBookHalfWidth(rect.width / 2);
    const clickX = e.clientX - rect.left;
    const isRightHalf = clickX > rect.width / 2;

    if (isRightHalf && canGoNext) {
      setDragSide('right');
      setDragStartX(e.clientX);
      setDragCurrentX(e.clientX);
      setIsDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } else if (!isRightHalf && canGoPrev) {
      setDragSide('left');
      setDragStartX(e.clientX);
      setDragCurrentX(e.clientX);
      setIsDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragCurrentX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const deltaX = dragCurrentX - dragStartX;
    const rect = bookRef.current?.getBoundingClientRect();
    const halfWidth = (rect?.width || 800) / 2;
    const dragThreshold = Math.min(100, halfWidth * 0.22);

    if (dragSide === 'right' && deltaX < -dragThreshold && canGoNext) {
      handleFlipNext();
    } else if (dragSide === 'left' && deltaX > dragThreshold && canGoPrev) {
      handleFlipPrev();
    }

    setIsDragging(false);
    setDragSide(null);
    setDragStartX(0);
    setDragCurrentX(0);
  };

  // Compute live drag rotation angle
  let liveDragAngle = 0;
  let dynamicShadowOpacity = 0;
  if (isDragging && bookHalfWidth > 0) {
    const deltaX = dragCurrentX - dragStartX;

    if (dragSide === 'right') {
      const progress = Math.max(0, Math.min(1, -deltaX / bookHalfWidth));
      liveDragAngle = -progress * 180;
      dynamicShadowOpacity = Math.sin(progress * Math.PI) * 0.45;
    } else if (dragSide === 'left') {
      const progress = Math.max(0, Math.min(1, deltaX / bookHalfWidth));
      liveDragAngle = -180 + progress * 180;
      dynamicShadowOpacity = Math.sin(progress * Math.PI) * 0.45;
    }
  }

  const cover = COVER_STYLES[coverStyle] || COVER_STYLES.leather;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-hidden select-none"
    >
      {/* Outer Notebook Hardcover Chassis */}
      <div
        ref={bookRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full max-w-6xl aspect-[1.45/1] max-h-[82vh] rounded-2xl md:rounded-3xl p-3 md:p-6 ${cover.bg} ${cover.border} border-4 md:border-8 notebook-book-shadow flex flex-col justify-between transition-all duration-300 touch-pan-y ${
          isDragging ? 'cursor-grabbing' : 'cursor-default'
        }`}
        style={{ perspective: '2200px' }}
      >
        {/* Bookmark Ribbon on top right */}
        <div className="absolute -top-3 right-16 w-8 h-16 bg-red-600 rounded-b shadow-lg z-40 pointer-events-none transform -skew-x-3 flex items-end justify-center pb-1">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[10px] border-b-transparent border-t-red-700/60" />
        </div>

        {/* Realistic Page Stack Depth Simulation (left & right side thickness) */}
        <div className="absolute inset-y-4 -left-2 w-3 bg-amber-100/90 rounded-l shadow-md border-y border-amber-300/40 pointer-events-none" />
        <div className="absolute inset-y-4 -right-2 w-3 bg-amber-100/90 rounded-r shadow-md border-y border-amber-300/40 pointer-events-none" />

        {/* Notebook Body (Pages Spread Container) */}
        <div className="relative w-full h-full bg-[#f8f6f0] rounded-xl overflow-hidden shadow-2xl flex flex-row">
          {dualPageMode ? (
            <>
              {/* LEFT PAGE */}
              <div
                className={`relative flex-1 h-full select-text ${
                  isFlippingBackward ? 'animate-flip-backward' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'right center',
                  transform:
                    isDragging && dragSide === 'left'
                      ? `perspective(2000px) rotateY(${liveDragAngle}deg)`
                      : undefined,
                  transition: isDragging ? 'none' : undefined,
                  zIndex: isFlippingBackward || (isDragging && dragSide === 'left') ? 35 : 10,
                }}
              >
                {leftPage ? (
                  <PageContent
                    page={leftPage}
                    side="left"
                    isCurrentPage={true}
                    activeTool={activeTool}
                    penColor={penColor}
                    penWidth={penWidth}
                    highlighterColor={highlighterColor}
                    highlighterWidth={highlighterWidth}
                    onUpdatePage={(upd) => onUpdatePage(leftPage.id, upd)}
                    onFlipPrev={canGoPrev ? handleFlipPrev : undefined}
                  />
                ) : (
                  <div className="w-full h-full bg-amber-50/50 flex items-center justify-center text-slate-400 font-mono text-sm">
                    Portada de Cuaderno
                  </div>
                )}

                {/* Central crease shadow on left page */}
                <div className="absolute inset-y-0 right-0 w-8 pointer-events-none spine-crease-left z-20" />

                {/* Dynamic Drag Light/Shadow Overlay */}
                {dynamicShadowOpacity > 0 && dragSide === 'right' && (
                  <div
                    className="absolute inset-0 bg-black pointer-events-none z-30 transition-opacity"
                    style={{ opacity: dynamicShadowOpacity }}
                  />
                )}
              </div>

              {/* BOOK SPINE (Central 3D Binding Shadow & Ring/Stitch Loops) */}
              <div className="relative w-8 md:w-12 h-full bg-gradient-to-r from-stone-900/45 via-stone-950/75 to-stone-900/45 shadow-inner z-30 flex flex-col justify-around items-center py-6 pointer-events-none border-x border-black/25">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-5 md:w-8 h-2 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 rounded-full shadow-md border border-slate-700/60 transform rotate-12"
                  />
                ))}
              </div>

              {/* RIGHT PAGE */}
              <div
                className={`relative flex-1 h-full select-text ${
                  isFlippingForward ? 'animate-flip-forward' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'left center',
                  transform:
                    isDragging && dragSide === 'right'
                      ? `perspective(2000px) rotateY(${liveDragAngle}deg)`
                      : undefined,
                  transition: isDragging ? 'none' : undefined,
                  zIndex: isFlippingForward || (isDragging && dragSide === 'right') ? 35 : 10,
                }}
              >
                {rightPage ? (
                  <PageContent
                    page={rightPage}
                    side="right"
                    isCurrentPage={true}
                    activeTool={activeTool}
                    penColor={penColor}
                    penWidth={penWidth}
                    highlighterColor={highlighterColor}
                    highlighterWidth={highlighterWidth}
                    onUpdatePage={(upd) => onUpdatePage(rightPage.id, upd)}
                    onFlipNext={canGoNext ? handleFlipNext : undefined}
                  />
                ) : (
                  <div className="w-full h-full paper-blank flex flex-col items-center justify-center text-slate-400 p-8 text-center select-none">
                    <p className="font-['Caveat',cursive] text-2xl text-slate-500 mb-2">
                      ¡Fin del cuaderno!
                    </p>
                    <p className="text-xs text-slate-400">
                      Usa el botón &quot;+ Nueva Hoja&quot; en la barra superior para continuar escribiendo.
                    </p>
                  </div>
                )}

                {/* Central crease shadow on right page */}
                <div className="absolute inset-y-0 left-0 w-8 pointer-events-none spine-crease-right z-20" />

                {/* Dynamic Drag Light/Shadow Overlay */}
                {dynamicShadowOpacity > 0 && dragSide === 'left' && (
                  <div
                    className="absolute inset-0 bg-black pointer-events-none z-30 transition-opacity"
                    style={{ opacity: dynamicShadowOpacity }}
                  />
                )}
              </div>
            </>
          ) : (
            /* SINGLE PAGE MODE (Responsive Mobile & Focused View) */
            <div
              className={`relative w-full h-full select-text ${
                isFlippingForward
                  ? 'animate-flip-forward'
                  : isFlippingBackward
                  ? 'animate-flip-backward'
                  : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: isDragging && dragSide === 'right' ? 'left center' : 'right center',
                transform:
                  isDragging && dragSide === 'right'
                    ? `perspective(2000px) rotateY(${liveDragAngle}deg)`
                    : isDragging && dragSide === 'left'
                    ? `perspective(2000px) rotateY(${liveDragAngle}deg)`
                    : undefined,
              }}
            >
              {leftPage && (
                <PageContent
                  page={leftPage}
                  side="single"
                  isCurrentPage={true}
                  activeTool={activeTool}
                  penColor={penColor}
                  penWidth={penWidth}
                  highlighterColor={highlighterColor}
                  highlighterWidth={highlighterWidth}
                  onUpdatePage={(upd) => onUpdatePage(leftPage.id, upd)}
                  onFlipNext={canGoNext ? handleFlipNext : undefined}
                  onFlipPrev={canGoPrev ? handleFlipPrev : undefined}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
