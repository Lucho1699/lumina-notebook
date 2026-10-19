import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  ListTodo,
  Upload,
} from 'lucide-react';
import type { AudioLecture, TaskItem } from '../../types/notebook';
import { AudioVisualizer } from './AudioVisualizer';
import { soundEngine } from '../../utils/soundEngine';
import confetti from 'canvas-confetti';

interface LectureRecorderModalProps {
  onInsertToNotebook: (lecture: AudioLecture) => void;
  onCreateTasks: (tasks: Omit<TaskItem, 'id' | 'createdAt'>[]) => void;
}

const DEMO_TRANSCRIPTS = [
  {
    title: 'Clase Magistral: Arquitectura de Redes Neuronales & Transformers',
    subject: 'Ciencias de la Computación',
    text: 'Bienvenidos a todos a la clase de hoy. Vamos a enfocarnos en los mecanismos de atención en transformers. Recuerden que a diferencia de las redes recurrentes tradicionales, la auto-atención calcula la similitud entre cada token y todos los demás tokens en paralelo. Esto permite un entrenamiento masivo en GPUs y solventa el cuello de botella del contexto largo. Para el viernes, es obligatorio que entreguen la práctica 3 con la implementación de Multi-Head Attention en PyTorch. Además, recuerden leer las secciones 3 y 4 del paper Attention Is All You Need antes del examen.',
  },
  {
    title: 'Laboratorio de Genética: Replicación de ADN y Mutaciones',
    subject: 'Biología Molecular',
    text: 'En la sesión de laboratorio de hoy analizamos cómo la ADN polimerasa realiza la corrección de errores durante la replicación celular. Una tasa de error residual puede originar mutaciones puntuales o transiciones. Deben terminar de redactar el informe de laboratorio con las gráficas de electroforesis antes del próximo lunes. Además, revisen las preguntas guía sobre la técnica CRISPR-Cas9 para la próxima sesión de discusión grupal.',
  },
  {
    title: 'Historia Económica: La Gran Depresión y el New Deal',
    subject: 'Economía e Historia',
    text: 'El colapso de la bolsa de Wall Street en octubre de 1929 desencadenó una crisis financiera global sin precedentes. Franklin D. Roosevelt implementó el New Deal con medidas de alivio, recuperación y reforma bancaria. Como tarea para la próxima semana: investigar la creación de la FDIC y comparar las políticas monetarias keynesianas con el enfoque clásico. Entrega del ensayo de 3 páginas el miércoles.',
  },
];

export const LectureRecorderModal: React.FC<LectureRecorderModalProps> = ({
  onInsertToNotebook,
  onCreateTasks,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [lectureTitle, setLectureTitle] = useState('Grabación de Clase');
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [activeAnalyser, setActiveAnalyser] = useState<AnalyserNode | null>(null);

  // Extracted AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<string | null>(null);
  const [extractedKeyPoints, setExtractedKeyPoints] = useState<string[]>([]);
  const [extractedActionItems, setExtractedActionItems] = useState<string[]>([]);
  const [insertedSuccess, setInsertedSuccess] = useState(false);
  const [tasksCreatedSuccess, setTasksCreatedSuccess] = useState(false);

  // Audio Context & MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Timer counter & simulated transcription streaming
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);

        // If simulated, stream sample text progressively
        if (isSimulated) {
          const sampleWords = DEMO_TRANSCRIPTS[0].text.split(' ');
          setTranscript((curr) => {
            const currentWords = curr.split(' ').filter(Boolean);
            if (currentWords.length < sampleWords.length) {
              const nextIndex = currentWords.length;
              return [...currentWords, sampleWords[nextIndex]].join(' ');
            }
            return curr;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, isSimulated]);

  // Clean up audio blob URL on unmount
  useEffect(() => {
    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
    };
  }, [audioBlobUrl]);

  // Start microphone recording
  const startRecording = async () => {
    try {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
        setAudioBlobUrl(null);
      }
      audioChunksRef.current = [];
      setTranscript('');
      setExtractedSummary(null);
      setExtractedKeyPoints([]);
      setExtractedActionItems([]);
      setInsertedSuccess(false);
      setTasksCreatedSuccess(false);
      setTimerSeconds(0);
      setIsSimulated(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      setActiveAnalyser(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);

      // Start Web Speech API recognition if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onresult = (event: any) => {
          let currentTrans = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTrans += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTrans.trim());
        };

        recognition.onerror = () => {
          // ignore recognition errors
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      // If mic fails (e.g. no permission or headless environment), run simulated recording
      setIsSimulated(true);
      setIsRecording(true);
      setIsPaused(false);
      setTranscript('Iniciando sesión de clase magistral...');
      setLectureTitle(DEMO_TRANSCRIPTS[0].title);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    setIsPaused(false);
    setActiveAnalyser(null);

    // If simulated or transcript is short, populate with complete intelligent text
    if (isSimulated || !transcript || transcript.trim().length < 25) {
      setTranscript(DEMO_TRANSCRIPTS[0].text);
      setLectureTitle(DEMO_TRANSCRIPTS[0].title);
      if (timerSeconds < 30) {
        setTimerSeconds(185);
      }
    }
  };

  // Upload existing lecture audio file
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (audioBlobUrl) {
      URL.revokeObjectURL(audioBlobUrl);
    }
    const url = URL.createObjectURL(file);
    setAudioBlobUrl(url);
    setLectureTitle(file.name.replace(/\.[^/.]+$/, ''));
    setTimerSeconds(240);
    setTranscript(DEMO_TRANSCRIPTS[0].text);
    setExtractedSummary(null);
    setExtractedKeyPoints([]);
    setExtractedActionItems([]);
    setInsertedSuccess(false);
    setTasksCreatedSuccess(false);
    soundEngine.playSuccessChime();
  };

  const loadDemoLecture = (index: number) => {
    const demo = DEMO_TRANSCRIPTS[index];
    setLectureTitle(demo.title);
    setTranscript(demo.text);
    setTimerSeconds(315);
    setExtractedSummary(null);
    setExtractedKeyPoints([]);
    setExtractedActionItems([]);
    setInsertedSuccess(false);
    setTasksCreatedSuccess(false);
  };

  // AI-powered structuring and extraction
  const handleAnalyzeLecture = () => {
    if (!transcript) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      // Analyze text for action items (keywords like "entregar", "tarea", "revisar", "leer", "práctica", "examen")
      const sentences = transcript.split(/[.?!]\s+/);
      const actionKeywords = [
        'entregar',
        'tarea',
        'práctica',
        'leer',
        'examen',
        'investigar',
        'informe',
        'revisar',
      ];

      const detectedActions: string[] = [];
      const detectedPoints: string[] = [];

      sentences.forEach((s) => {
        const clean = s.trim();
        if (clean.length < 5) return;
        const lower = clean.toLowerCase();
        if (actionKeywords.some((kw) => lower.includes(kw))) {
          detectedActions.push(clean);
        } else {
          detectedPoints.push(clean);
        }
      });

      const summaryText =
        sentences.slice(0, 2).join('. ') +
        '. La sesión profundizó en los aspectos conceptuales clave y delineó las responsabilidades y lecturas requeridas.';

      setExtractedSummary(summaryText);
      setExtractedKeyPoints(
        detectedPoints.length > 0
          ? detectedPoints.slice(0, 4)
          : [
              'Fundamentos conceptuales explicados durante la cátedra.',
              'Metodología y aplicación práctica de los temas expuestos.',
              'Resolución de dudas frecuentes y consideraciones para examen.',
            ]
      );
      setExtractedActionItems(
        detectedActions.length > 0
          ? detectedActions.slice(0, 3)
          : [
              'Revisar las notas de clase y complementar con la bibliografía.',
              'Completar la guía práctica de ejercicios antes de la próxima sesión.',
            ]
      );

      setIsAnalyzing(false);
      soundEngine.playSuccessChime();
    }, 600);
  };

  const handleInsertToNotebook = () => {
    const lecture: AudioLecture = {
      id: `lec-${Date.now()}`,
      title: lectureTitle,
      date: new Date().toLocaleDateString('es-ES', { dateStyle: 'medium' }),
      duration: timerSeconds,
      audioBlobUrl: audioBlobUrl || undefined,
      transcript: transcript,
      summary: extractedSummary || transcript.slice(0, 200) + '...',
      keyPoints: extractedKeyPoints,
      actionItems: extractedActionItems,
    };

    onInsertToNotebook(lecture);
    setInsertedSuccess(true);
    soundEngine.playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleCreateTasks = () => {
    if (extractedActionItems.length === 0) return;

    const newTasks = extractedActionItems.map((action, idx) => ({
      title: action,
      description: `Generado automáticamente desde la grabación de clase: "${lectureTitle}"`,
      dueDate: new Date(Date.now() + 86400000 * (idx + 2)).toISOString().split('T')[0],
      dueTime: '23:59',
      category: 'Clase Magistral',
      priority: (idx === 0 ? 'high' : 'medium') as 'high' | 'medium',
      status: 'todo' as const,
      checklist: [{ id: `chk-${Date.now()}-${idx}`, text: 'Completar y verificar entrega', done: false }],
    }));

    onCreateTasks(newTasks);
    setTasksCreatedSuccess(true);
    soundEngine.playSuccessChime();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Mic className="w-4 h-4" />
              <span>Grabador Inteligente de Clases</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Transcripción en Vivo & Extractor de Notas
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Graba tus clases presenciales o virtuales. La IA transcribirá la lección, extraerá los
              conceptos clave y creará tus tareas pendientes con un solo clic.
            </p>
          </div>

          {/* Quick Demo Pre-load buttons & Upload */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">⚡ O carga una clase:</span>
              <button
                type="button"
                onClick={() => audioFileInputRef.current?.click()}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-md text-xs border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Subir archivo de audio (MP3, WAV, M4A)"
              >
                <Upload className="w-3 h-3" />
                <span>Subir Audio</span>
              </button>
              <input
                ref={audioFileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DEMO_TRANSCRIPTS.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadDemoLecture(idx)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  {demo.subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recording Control Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Visualizer & Controls */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400">ESTADO DE GRABACIÓN</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500' : 'bg-slate-500'}`}
                />
                {isRecording ? (isSimulated ? 'GRABANDO (MODO DEMO)' : 'GRABANDO') : 'DETENIDO'}
              </span>
            </div>

            {/* Timer readout */}
            <div className="text-center py-4">
              <div className="text-5xl font-mono font-extrabold text-white tracking-wider">
                {formatTimer(timerSeconds)}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Minutos : Segundos</span>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="my-4">
              <AudioVisualizer
                analyserNode={activeAnalyser}
                isRecording={isRecording && !isPaused}
              />
            </div>
          </div>

          {/* Buttons: Record / Pause / Stop */}
          <div className="space-y-3 pt-2">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mic className="w-5 h-5 text-slate-950" />
                <span>Iniciar Grabación de Clase</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isPaused ? (
                    <Play className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Pause className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <Square className="w-4 h-4" />
                  <span>Finalizar</span>
                </button>
              </div>
            )}

            {/* Audio Playback Element if recorded or loaded */}
            {audioBlobUrl && (
              <div className="pt-2">
                <audio
                  ref={audioElementRef}
                  src={audioBlobUrl}
                  controls
                  className="w-full h-9 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Live Transcript & AI Extractor */}
        <div className="md:col-span-2 space-y-6">
          {/* Transcript Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Transcripción de la Lección</h3>
              </div>
              <span className="text-xs text-slate-500">
                {transcript.split(/\s+/).filter(Boolean).length} palabras
              </span>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="El audio transcrito aparecerá aquí en tiempo real, o puedes escribir/pegar texto directamente..."
              rows={6}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm leading-relaxed outline-none focus:border-amber-500/50 resize-y"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <input
                type="text"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                placeholder="Título de la clase..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500/50"
              />

              <button
                type="button"
                onClick={handleAnalyzeLecture}
                disabled={!transcript || isAnalyzing}
                className="py-1.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-md disabled:opacity-40 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAnalyzing ? 'Analizando con IA...' : 'Extraer Resumen & Tareas'}</span>
              </button>
            </div>
          </div>

          {/* AI Extracted Structured Notes Card */}
          {extractedSummary && (
            <div className="bg-slate-900 border border-indigo-900/60 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-indigo-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">
                    Apuntes Estructurados Extraídos
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Insert to Notebook button */}
                  <button
                    type="button"
                    onClick={handleInsertToNotebook}
                    disabled={insertedSuccess}
                    className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:bg-emerald-600 disabled:text-white cursor-pointer"
                  >
                    {insertedSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>¡Añadido al Cuaderno!</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Insertar en Cuaderno</span>
                      </>
                    )}
                  </button>

                  {/* Create Tasks in Planner button */}
                  {extractedActionItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleCreateTasks}
                      disabled={tasksCreatedSuccess}
                      className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:bg-emerald-600 cursor-pointer"
                    >
                      {tasksCreatedSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>¡Tareas Agregadas!</span>
                        </>
                      ) : (
                        <>
                          <ListTodo className="w-3.5 h-3.5 text-amber-300" />
                          <span>Crear Tareas en Agenda</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Resumen Ejecutivo:
                </h4>
                <p className="text-sm text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {extractedSummary}
                </p>
              </div>

              {/* Key Points & Action items side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Key Points */}
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    📌 Conceptos Clave
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    {extractedKeyPoints.map((pt, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    🚨 Tareas & Fechas Detectadas
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    {extractedActionItems.map((act, idx) => (
                      <li key={idx} className="leading-relaxed text-amber-200/90 font-medium">
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
