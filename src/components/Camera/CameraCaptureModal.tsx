import React, { useState, useRef } from 'react';
import { Camera, X, Check, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import type { NotebookPage } from '../../types/notebook';
import { triggerHapticFeedback } from '../../utils/haptics';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhotoPage: (page: NotebookPage) => void;
  pageCount: number;
  activeSubject?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onAddPhotoPage,
  pageCount,
  activeSubject = 'Apuntes de Clase',
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCaptureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoDataUrl(result);
      if (!photoTitle) {
        setPhotoTitle(`📸 Foto de Pizarra / Diapositiva`);
      }
      triggerHapticFeedback('light');
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setPhotoDataUrl(null);
    setPhotoTitle('');
    setNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveToNotebook = () => {
    if (!photoDataUrl) return;

    triggerHapticFeedback('success');
    const newPageNum = pageCount + 1;
    const finalTitle = photoTitle.trim() || `📸 Captura #${newPageNum}`;

    const newPage: NotebookPage = {
      id: `page-cam-${Date.now()}`,
      pageNumber: newPageNum,
      title: finalTitle,
      subject: activeSubject,
      texture: 'blank',
      handwritingFont: false,
      content: `<h2>${finalTitle}</h2>
<p><em>Capturado con la cámara móvil • ${new Date().toLocaleDateString('es-ES')}</em></p>
<div style="text-align: center; margin: 12px 0;">
  <img src="${photoDataUrl}" alt="${finalTitle}" style="max-width: 100%; max-height: 480px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
</div>
${notes.trim() ? `<blockquote><strong>Notas del estudiante:</strong><p>${notes.trim()}</p></blockquote>` : ''}`,
      drawings: [],
      stickers: [
        {
          id: `stk-cam-${Date.now()}`,
          text: '📸 Foto integrada',
          color: 'blue',
          x: 70,
          y: 80,
          rotation: -3,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onAddPhotoPage(newPage);
    handleRetake();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Capturar con Cámara / Galería</h2>
              <p className="text-[11px] text-slate-400">Fotografía pizarras, diapositivas o apuntes físicos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Hidden input for camera capture */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCaptureFile}
            className="hidden"
          />

          {!photoDataUrl ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 rounded-2xl p-8 bg-slate-950/60 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Toma una foto de tu clase</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Apunta a la diapositiva o al tablero para añadirla directamente como página de tu cuaderno.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Abrir Cámara</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                      fileInputRef.current.setAttribute('capture', 'environment');
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Galería</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-60 bg-black flex items-center justify-center">
                <img src={photoDataUrl} alt="Preview" className="max-h-60 object-contain w-full" />
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-medium backdrop-blur-md flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Repetir</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Título del apunte</label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Ej. Pizarra: Teorema Fundamental"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Notas u observaciones adicionales (opcional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe lo que el profesor explicó sobre esta diapositiva..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveToNotebook}
                className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Insertar Página en el Cuaderno</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
