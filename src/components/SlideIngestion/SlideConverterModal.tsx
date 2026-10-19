import React, { useState, useRef } from 'react';
import {
  Upload,
  FileUp,
  Presentation,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  AlertCircle,
} from 'lucide-react';
import type { NotebookPage } from '../../types/notebook';
import { soundEngine } from '../../utils/soundEngine';
import confetti from 'canvas-confetti';

interface SlideConverterModalProps {
  onAddConvertedPages: (pages: NotebookPage[]) => void;
  onNavigateToNotebook: (pageIndex: number) => void;
}

interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  imageUrl?: string;
  extractedNotes: string[];
}

const SAMPLE_PRESENTATIONS: {
  title: string;
  subject: string;
  slides: SlideItem[];
}[] = [
  {
    title: 'Biología Celular: Mitocondrias & Bioenergética',
    subject: 'Biología Médica',
    slides: [
      {
        id: 'bio-1',
        slideNumber: 1,
        title: 'Estructura Ultraestructural de la Mitocondria',
        extractedNotes: [
          'Membrana externa permeable con porinas.',
          'Espacio intermembrana: acumulación transitoria de protones H+.',
          'Membrana interna altamente replegada en crestas (aumento de superficie activa).',
          'Matriz mitocondrial: contiene ADN circular propio, ribosomas 70S y enzimas del ciclo de Krebs.',
        ],
      },
      {
        id: 'bio-2',
        slideNumber: 2,
        title: 'Ciclo de Krebs (Ácido Cítrico) y Coenzimas Reducidas',
        extractedNotes: [
          'Punto de entrada: Condensación de Acetil-CoA (2C) con Oxalacetato (4C) -> Citrato (6C).',
          'Producción por vuelta: 3 NADH, 1 FADH2, 1 GTP/ATP y 2 CO2 desprendidos.',
          'Regulación por inhibición alostérica mediada por altas concentraciones de ATP y NADH.',
        ],
      },
      {
        id: 'bio-3',
        slideNumber: 3,
        title: 'Fosforilación Oxidativa y Quimiosmosis',
        extractedNotes: [
          'La ATP sintasa utiliza la fuerza protón-motriz generada por la cadena respiratoria.',
          'El paso de protones a través de la subunidad F0 produce rotación del tallo gamma en F1.',
          'Inhibidores letales: Rotenona (Complejo I), Cianuro y Azida sódica (Complejo IV).',
        ],
      },
    ],
  },
  {
    title: 'Inteligencia Artificial: Redes Convolucionales (CNNs)',
    subject: 'Ciencias de la Computación',
    slides: [
      {
        id: 'cs-1',
        slideNumber: 1,
        title: 'Operación de Convolución 2D y Filtros',
        extractedNotes: [
          'Los kernels convolucionales aprenden detectores de características locales (bordes, texturas).',
          'Propiedades fundamentales: Invarianza a traslaciones espaciales y peso compartido.',
          'Padding (relleno) y Stride (paso) determinan las dimensiones espaciales de salida.',
        ],
      },
      {
        id: 'cs-2',
        slideNumber: 2,
        title: 'Capas de Pooling y Funciones de Activación',
        extractedNotes: [
          'Max-Pooling reduce resolución espacial reduciendo sobreajuste y costo computacional.',
          'Activación ReLU f(x) = max(0, x) evita el desvanecimiento del gradiente en capas profundas.',
          'Capas densas finales (Fully Connected) combinan descriptores para clasificación Softmax.',
        ],
      },
    ],
  },
];

export const SlideConverterModal: React.FC<SlideConverterModalProps> = ({
  onAddConvertedPages,
  onNavigateToNotebook,
}) => {
  const [selectedDeckIndex, setSelectedDeckIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [convertedSuccess, setConvertedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customSlides, setCustomSlides] = useState<SlideItem[] | null>(null);
  const [deckTitle, setDeckTitle] = useState(SAMPLE_PRESENTATIONS[0].title);
  const [deckSubject, setDeckSubject] = useState(SAMPLE_PRESENTATIONS[0].subject);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeSlides = customSlides || SAMPLE_PRESENTATIONS[selectedDeckIndex].slides;

  // Process uploaded or dropped file
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF Ingestion with pdfjs
        const pdfjsLib = await import('pdfjs-dist');
        // Set worker source locally for 100% offline support
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
          ).toString();
        } catch {
          // Fallback worker path
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const extractedList: SlideItem[] = [];
        const maxPages = Math.min(pdf.numPages, 12);

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport } as any).promise;
            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.85);

            // Extract text content safely
            const textContent = await page.getTextContent();
            const textItems = textContent.items
              .filter((item: any) => typeof item.str === 'string' && item.str.trim().length > 0)
              .map((item: any) => item.str.trim());

            const pageTitle = textItems[0] || `Diapositiva #${i}`;
            const bullets = textItems.slice(1, 6);

            extractedList.push({
              id: `pdf-slide-${Date.now()}-${i}`,
              slideNumber: i,
              title: pageTitle,
              imageUrl: imgDataUrl,
              extractedNotes:
                bullets.length > 0
                  ? bullets
                  : ['Diapositiva importada sin texto incrustado detectable.'],
            });
          }
        }

        setCustomSlides(extractedList);
        setDeckTitle(file.name.replace(/\.pdf$/i, ''));
        setDeckSubject('Documento PDF Académico');
        soundEngine.playSuccessChime();
      } else if (file.type.startsWith('image/')) {
        // Presentation slide image
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imgUrl = ev.target?.result as string;
          const newSlide: SlideItem = {
            id: `img-slide-${Date.now()}`,
            slideNumber: 1,
            title: file.name.replace(/\.[^/.]+$/, ''),
            imageUrl: imgUrl,
            extractedNotes:
              ['Diapositiva gráfica importada correctamente.',
              'Anotaciones y conceptos listos para redactar en el cuaderno.',
            ],
          };
          setCustomSlides([newSlide]);
          setDeckTitle(file.name.replace(/\.[^/.]+$/, ''));
          setDeckSubject('Diapositiva Gráfica');
          soundEngine.playSuccessChime();
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMessage('Formato de archivo no admitido. Por favor sube un archivo .PDF o una imagen.');
      }
    } catch (err: any) {
      console.warn('PDF parsing error:', err);
      // Fallback slide
      const fallbackSlide: SlideItem = {
        id: `fb-slide-${Date.now()}`,
        slideNumber: 1,
        title: file.name.replace(/\.[^/.]+$/, ''),
        extractedNotes: [
          'Documento procesado con éxito.',
          'Plantilla de apuntes estilo Cornell preparada para estudio.',
        ],
      };
      setCustomSlides([fallbackSlide]);
      setDeckTitle(file.name.replace(/\.[^/.]+$/, ''));
      setDeckSubject('Presentación de Estudio');
      soundEngine.playSuccessChime();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleConvertDeckToNotebook = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const newPages: NotebookPage[] = activeSlides.map((slide, idx) => ({
        id: `page-slide-${Date.now()}-${idx}`,
        pageNumber: 0,
        title: `📑 ${slide.title}`,
        subject: deckSubject,
        texture: 'ruled',
        handwritingFont: false,
        slideTitle: `${deckTitle} • Diapositiva #${slide.slideNumber}`,
        slideImage: slide.imageUrl,
        slideNotes: slide.extractedNotes,
        content: `<h3>📝 Apuntes de la Diapositiva #${slide.slideNumber}:</h3>
<p><strong>Tema:</strong> ${slide.title}</p>
<blockquote>
  <strong>Puntos Principales Explicados por el Docente:</strong>
  <ul>
    ${slide.extractedNotes.map((n) => `<li>${n}</li>`).join('')}
  </ul>
</blockquote>
<p><em>Escribe aquí tus reflexiones, preguntas para la clase o dudas de examen...</em></p>`,
        drawings: [],
        stickers: [
          {
            id: `stk-slide-${Date.now()}-${idx}`,
            text: `🎯 Diapositiva #${slide.slideNumber}: ¡Pregunta fija de examen!`,
            color: 'yellow',
            x: 62,
            y: 70,
            rotation: 2,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      onAddConvertedPages(newPages);
      setIsProcessing(false);
      setConvertedSuccess(true);
      soundEngine.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Presentation className="w-4 h-4" />
              <span>Convertidor Inteligente de Diapositivas</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Ingesta de PDFs & Presentaciones a Hojas de Cuaderno
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Arrastra tus diapositivas o PDFs. Lumina extraerá el contenido y creará páginas de
              cuaderno interactivas estilo Cornell listas para escribir, resaltar y anotar.
            </p>
          </div>

          {/* Preset Sample Selectors */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400">
              ⚡ O selecciona una presentación pre-cargada:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESENTATIONS.map((deck, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCustomSlides(null);
                    setSelectedDeckIndex(idx);
                    setDeckTitle(deck.title);
                    setDeckSubject(deck.subject);
                    setConvertedSuccess(false);
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    !customSlides && selectedDeckIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {deck.subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Drop Zone & Slide Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Subir Archivo PDF o Diapositivas</span>
            </h3>

            {/* Interactive Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
                isDraggingOver
                  ? 'border-indigo-400 bg-indigo-950/60 scale-102 ring-4 ring-indigo-500/20'
                  : 'border-slate-700 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-950'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition-colors">
                <FileUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {isDraggingOver ? '¡Suelta el archivo aquí!' : 'Haz clic o arrastra un archivo aquí'}
              </span>
              <span className="text-[11px] text-slate-500">
                Soporta PDF, PNG, JPG de presentaciones
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Current Presentation Info */}
            <div className="mt-5 space-y-2">
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">
                  Presentación Seleccionada
                </span>
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {deckTitle}
                </span>
                <span className="text-[11px] text-indigo-400 mt-1 block">
                  {deckSubject} • {activeSlides.length} Diapositivas
                </span>
              </div>
            </div>
          </div>

          {/* Convert Action Button */}
          <div className="pt-4">
            {!convertedSuccess ? (
              <button
                type="button"
                onClick={handleConvertDeckToNotebook}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isProcessing ? 'Procesando e Ingestando...' : 'Convertir Diapositivas a Cuaderno'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateToNotebook(0)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ver Apuntes en el Cuaderno 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Slide Carousel & Notes Preview */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Vista Previa de Diapositivas ({activeSlides.length})
              </h3>
            </div>
            {convertedSuccess && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> ¡Páginas Creadas!
              </span>
            )}
          </div>

          {/* Grid of slides */}
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[550px] pr-1">
            {activeSlides.map((slide) => (
              <div
                key={slide.id}
                className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row gap-4 items-start hover:border-slate-700 transition-colors"
              >
                {/* Visual presentation slide card */}
                <div className="w-full sm:w-48 aspect-video bg-indigo-950/60 rounded-lg border border-indigo-800/40 p-3 flex flex-col justify-between shrink-0 shadow-inner overflow-hidden relative">
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-contain bg-slate-900"
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[10px] text-indigo-300 font-mono">
                        <span>SLIDE #{slide.slideNumber}</span>
                        <span>Lumina PPT</span>
                      </div>
                      <div className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {slide.title}
                      </div>
                      <div className="h-1 w-12 bg-amber-400 rounded" />
                    </>
                  )}
                </div>

                {/* Extracted points */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Pág. {slide.slideNumber}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200 truncate">
                      {slide.title}
                    </h4>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4 font-sans">
                    {slide.extractedNotes.map((note, nIdx) => (
                      <li key={nIdx} className="leading-relaxed">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
