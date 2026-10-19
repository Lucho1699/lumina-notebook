import React, { useState, useEffect } from 'react';
import type {
  Notebook,
  NotebookPage,
  TaskItem,
  AudioLecture,
  NotebookSettings,
  ActiveTab,
  PaperTexture,
} from './types/notebook';
import {
  loadStoredNotebooks,
  saveStoredNotebooks,
  loadActiveNotebookId,
  saveActiveNotebookId,
  loadStoredPages,
  saveStoredPages,
  loadStoredTasks,
  saveStoredTasks,
  loadStoredLectures,
  saveStoredLectures,
  loadStoredSettings,
  saveStoredSettings,
  loadCurrentPageIndex,
  saveCurrentPageIndex,
  resetAllData,
} from './utils/storage';
import { exportNotebookToPDF, exportDataBackup } from './utils/exportUtils';
import { soundEngine } from './utils/soundEngine';

import { Header } from './components/UI/Header';
import { SettingsModal } from './components/UI/SettingsModal';
import { LibraryView } from './components/Library/LibraryView';
import { BookContainer } from './components/Notebook/BookContainer';
import { NotebookToolbar } from './components/Notebook/NotebookToolbar';
import { PageThumbnailsModal } from './components/Notebook/PageThumbnailsModal';
import { PlannerView } from './components/Planner/PlannerView';
import { LectureRecorderModal } from './components/AudioRecorder/LectureRecorderModal';
import { SlideConverterModal } from './components/SlideIngestion/SlideConverterModal';
import { AuthModal } from './components/Auth/AuthModal';
import { MobileNavBar } from './components/UI/MobileNavBar';
import { CameraCaptureModal } from './components/Camera/CameraCaptureModal';

export const App: React.FC = () => {
  // Multi-notebook collection state
  const [notebooks, setNotebooks] = useState<Notebook[]>(loadStoredNotebooks);
  const [activeNotebookId, setActiveNotebookId] = useState<string>(loadActiveNotebookId);

  // Active notebook resolution
  const activeNotebook =
    notebooks.find((n) => n.id === activeNotebookId) || notebooks[0];

  // Primary application state
  const [pages, setPages] = useState<NotebookPage[]>(() => {
    return activeNotebook && activeNotebook.pages && activeNotebook.pages.length > 0
      ? activeNotebook.pages
      : loadStoredPages();
  });
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() => {
    return activeNotebook && activeNotebook.currentPageIndex !== undefined
      ? activeNotebook.currentPageIndex
      : loadCurrentPageIndex();
  });

  const [tasks, setTasks] = useState<TaskItem[]>(loadStoredTasks);
  const [lectures, setLectures] = useState<AudioLecture[]>(loadStoredLectures);
  const [settings, setSettings] = useState<NotebookSettings>(loadStoredSettings);

  const [activeTab, setActiveTab] = useState<ActiveTab>('notebook');

  // Drawing tool state
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'highlighter' | 'eraser'>('select');
  const [penColor, setPenColor] = useState<string>(settings.penColor || '#2563eb');
  const [penWidth, setPenWidth] = useState<number>(settings.penWidth || 3);
  const [highlighterColor, setHighlighterColor] = useState<string>(settings.highlighterColor || '#facc15');

  // Modal visibility
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Sync sound engine enabled state
  useEffect(() => {
    soundEngine.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Persist notebooks and sync active notebook's pages
  useEffect(() => {
    saveStoredNotebooks(notebooks);
  }, [notebooks]);

  // Persist active notebook ID
  useEffect(() => {
    saveActiveNotebookId(activeNotebookId);
  }, [activeNotebookId]);

  // Persist pages
  useEffect(() => {
    saveStoredPages(pages);
  }, [pages]);

  // Persist current page index
  useEffect(() => {
    saveCurrentPageIndex(currentPageIndex);
  }, [currentPageIndex]);

  // Persist tasks
  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  // Persist lectures
  useEffect(() => {
    saveStoredLectures(lectures);
  }, [lectures]);

  // Persist settings
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Re-number pages on changes
  const renumberPages = (pageList: NotebookPage[]): NotebookPage[] => {
    return pageList.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
  };

  // Safe navigation with per-notebook page index tracking
  const handlePageChange = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index);
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebookId
            ? { ...nb, currentPageIndex: index, updatedAt: Date.now() }
            : nb
        )
      );
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      soundEngine.playPageFlip();
      const nextIdx = settings.dualPageMode
        ? Math.max(0, currentPageIndex - 2)
        : Math.max(0, currentPageIndex - 1);
      setCurrentPageIndex(nextIdx);
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebookId
            ? { ...nb, currentPageIndex: nextIdx, updatedAt: Date.now() }
            : nb
        )
      );
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      soundEngine.playPageFlip();
      const nextIdx = settings.dualPageMode
        ? Math.min(pages.length - 1, currentPageIndex + 2)
        : Math.min(pages.length - 1, currentPageIndex + 1);
      setCurrentPageIndex(nextIdx);
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebookId
            ? { ...nb, currentPageIndex: nextIdx, updatedAt: Date.now() }
            : nb
        )
      );
    }
  };

  // Notebook switching & management
  const handleSelectNotebook = (targetId: string) => {
    if (targetId === activeNotebookId) {
      setActiveTab('notebook');
      return;
    }

    const targetNb = notebooks.find((n) => n.id === targetId);
    if (!targetNb) return;

    // Flush current state to notebooks
    const updatedNotebooks = notebooks.map((nb) =>
      nb.id === activeNotebookId
        ? { ...nb, pages, currentPageIndex, updatedAt: Date.now() }
        : nb
    );

    setActiveNotebookId(targetId);
    saveActiveNotebookId(targetId);
    setPages(targetNb.pages);
    saveStoredPages(targetNb.pages);
    const targetPageIdx = targetNb.currentPageIndex || 0;
    setCurrentPageIndex(targetPageIdx);
    saveCurrentPageIndex(targetPageIdx);

    setNotebooks(updatedNotebooks);
    saveStoredNotebooks(updatedNotebooks);

    setActiveTab('notebook');
    soundEngine.playPageFlip();
  };

  const handleCreateNotebook = (newNbData: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `nb-${Date.now()}`;
    const newNotebook: Notebook = {
      ...newNbData,
      id: newId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Flush active notebook state first so in-memory changes are not lost
    const flushedNotebooks = notebooks.map((nb) =>
      nb.id === activeNotebookId
        ? { ...nb, pages, currentPageIndex, updatedAt: Date.now() }
        : nb
    );

    const updated = [newNotebook, ...flushedNotebooks];
    setNotebooks(updated);
    saveStoredNotebooks(updated);

    setActiveNotebookId(newId);
    saveActiveNotebookId(newId);
    setPages(newNotebook.pages);
    saveStoredPages(newNotebook.pages);
    setCurrentPageIndex(0);
    saveCurrentPageIndex(0);

    setActiveTab('notebook');
    soundEngine.playPageFlip();
  };

  const handleUpdateNotebook = (id: string, updatedProps: Partial<Notebook>) => {
    const updated = notebooks.map((nb) =>
      nb.id === id ? { ...nb, ...updatedProps, updatedAt: Date.now() } : nb
    );
    setNotebooks(updated);
    saveStoredNotebooks(updated);
  };

  const handleDuplicateNotebook = (id: string) => {
    const nb = notebooks.find((n) => n.id === id);
    if (!nb) return;

    // If duplicating the active notebook, use up-to-date in-memory pages
    const sourcePages = id === activeNotebookId ? pages : nb.pages;

    const duplicatedPages = sourcePages.map((p, idx) => ({
      ...p,
      id: `page-dup-${Date.now()}-${idx}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    const duplicatedNb: Notebook = {
      ...nb,
      id: `nb-dup-${Date.now()}`,
      title: `${nb.title} (Copia)`,
      pages: duplicatedPages,
      currentPageIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [duplicatedNb, ...notebooks];
    setNotebooks(updated);
    saveStoredNotebooks(updated);
    soundEngine.playSuccessChime();
  };

  const handleDeleteNotebook = (id: string) => {
    if (notebooks.length <= 1) {
      alert('Debes conservar al menos un cuaderno en tu biblioteca.');
      return;
    }
    const target = notebooks.find((n) => n.id === id);
    if (!window.confirm(`¿Seguro que deseas eliminar el cuaderno "${target?.title}"?`)) return;

    const updated = notebooks.filter((n) => n.id !== id);
    setNotebooks(updated);
    saveStoredNotebooks(updated);

    if (activeNotebookId === id) {
      const nextNb = updated[0];
      setActiveNotebookId(nextNb.id);
      saveActiveNotebookId(nextNb.id);
      setPages(nextNb.pages);
      saveStoredPages(nextNb.pages);
      const nextIdx = nextNb.currentPageIndex || 0;
      setCurrentPageIndex(nextIdx);
      saveCurrentPageIndex(nextIdx);
    }
    soundEngine.playPageFlip();
  };

  // Helper to update pages and synchronize with the active notebook in the notebooks list
  const updatePages = (updater: (prev: NotebookPage[]) => NotebookPage[]) => {
    const nextPages = updater(pages);
    setPages(nextPages);
    setNotebooks((prevNb) =>
      prevNb.map((nb) =>
        nb.id === activeNotebookId
          ? { ...nb, pages: nextPages, updatedAt: Date.now() }
          : nb
      )
    );
  };

  // Add new page to notebook
  const handleAddPage = () => {
    const newPageNumber = pages.length + 1;
    const newPage: NotebookPage = {
      id: `page-${Date.now()}`,
      pageNumber: newPageNumber,
      title: `Apunte #${newPageNumber}`,
      subject: activeNotebook?.subject || 'Notas de Estudio',
      texture: activeNotebook?.defaultTexture || settings.defaultTexture || 'ruled',
      content: '<p>Comienza a escribir tus apuntes aquí...</p>',
      handwritingFont: false,
      drawings: [],
      stickers: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    updatePages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    soundEngine.playPageFlip();
  };

  // Duplicate current page
  const handleDuplicatePage = () => {
    const current = pages[currentPageIndex];
    if (!current) return;

    const duplicated: NotebookPage = {
      ...current,
      id: `page-${Date.now()}`,
      title: `${current.title} (Copia)`,
      drawings: [...current.drawings],
      stickers: [...current.stickers],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    updatePages((prev) => {
      const updated = [...prev];
      updated.splice(currentPageIndex + 1, 0, duplicated);
      return renumberPages(updated);
    });
    setCurrentPageIndex(currentPageIndex + 1);
    soundEngine.playPageFlip();
  };

  // Delete current page
  const handleDeletePage = () => {
    if (pages.length <= 1) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta página del cuaderno?')) return;

    const targetIdx = currentPageIndex;
    updatePages((prev) => {
      const updated = prev.filter((_, idx) => idx !== targetIdx);
      return renumberPages(updated);
    });
    setCurrentPageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 2)));
    soundEngine.playPageFlip();
  };

  // Add sticky note to current page
  const handleAddSticker = () => {
    const current = pages[currentPageIndex];
    if (!current) return;

    const colors: ('yellow' | 'pink' | 'blue' | 'green' | 'purple')[] = [
      'yellow',
      'pink',
      'blue',
      'green',
      'purple',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newSticker = {
      id: `stk-${Date.now()}`,
      text: 'Nueva nota adhesiva...',
      color: randomColor,
      x: 35 + Math.random() * 20,
      y: 30 + Math.random() * 20,
      rotation: (Math.random() - 0.5) * 8,
    };

    const updatedCurrent = {
      ...current,
      stickers: [...(current.stickers || []), newSticker],
    };

    updatePages((prev) => prev.map((p) => (p.id === current.id ? updatedCurrent : p)));
    soundEngine.playStickerSound();
  };

  // Update specific page content/attributes
  const handleUpdatePage = (pageId: string, updatedProps: Partial<NotebookPage>) => {
    updatePages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, ...updatedProps, updatedAt: Date.now() } : p))
    );
  };

  // Undo last drawing stroke on current page
  const handleUndoStroke = () => {
    const current = pages[currentPageIndex];
    if (!current || !current.drawings || current.drawings.length === 0) return;
    const updatedDrawings = current.drawings.slice(0, -1);
    handleUpdatePage(current.id, { drawings: updatedDrawings });
  };

  // Clear all drawings on current page
  const handleClearDrawings = () => {
    const current = pages[currentPageIndex];
    if (!current || !current.drawings || current.drawings.length === 0) return;
    if (window.confirm('¿Deseas borrar todos los trazos de esta página?')) {
      handleUpdatePage(current.id, { drawings: [] });
    }
  };

  // Keyboard shortcut Ctrl+Z to undo drawing stroke
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          Boolean(target.closest('[contenteditable="true"]'))
        ) {
          return;
        }
        if (activeTool !== 'select') {
          e.preventDefault();
          handleUndoStroke();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Change paper texture of current page
  const handleChangeCurrentTexture = (texture: PaperTexture) => {
    const current = pages[currentPageIndex];
    if (current) {
      handleUpdatePage(current.id, { texture });
    }
  };

  // Ingest audio lecture into a new structured page in the notebook
  const handleInsertLectureToNotebook = (lecture: AudioLecture) => {
    setLectures((prev) => [lecture, ...prev]);

    const newPage: NotebookPage = {
      id: `page-lec-${Date.now()}`,
      pageNumber: pages.length + 1,
      title: `🎙️ ${lecture.title}`,
      subject: activeNotebook?.subject || 'Clase Magistral Grabada',
      texture: 'ruled',
      handwritingFont: false,
      audioRecordingId: lecture.id,
      content: `<h2>🎙️ ${lecture.title}</h2>
<p><em>Fecha: ${lecture.date} • Duración: ${Math.floor(lecture.duration / 60)}m ${lecture.duration % 60}s</em></p>
<blockquote>
  <strong>Resumen de la Sesión:</strong>
  <p>${lecture.summary}</p>
</blockquote>
<h3>📌 Conceptos Fundamentales:</h3>
<ul>
  ${lecture.keyPoints.map((pt) => `<li>${pt}</li>`).join('')}
</ul>
<h3>🚨 Deberes & Tareas Asignadas:</h3>
<ul>
  ${lecture.actionItems.map((act) => `<li><strong>${act}</strong></li>`).join('')}
</ul>`,
      drawings: [],
      stickers: [
        {
          id: `stk-lec-${Date.now()}`,
          text: `🎙️ Grabación vinculada (${lecture.date})`,
          color: 'blue',
          x: 65,
          y: 75,
          rotation: -2,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    updatePages((prev) => renumberPages([...prev, newPage]));
    setCurrentPageIndex(pages.length);
    setActiveTab('notebook');
  };

  // Add tasks created by lecture recorder
  const handleCreateTasksFromLecture = (newTasks: Omit<TaskItem, 'id' | 'createdAt'>[]) => {
    const formatted = newTasks.map((t, idx) => ({
      ...t,
      id: `task-lec-${Date.now()}-${idx}`,
      createdAt: Date.now(),
    }));
    setTasks((prev) => [...formatted, ...prev]);
  };

  // Add pages converted from slides / PDF
  const handleAddConvertedSlidePages = (newSlidePages: NotebookPage[]) => {
    const startIndex = pages.length;
    updatePages((prev) => renumberPages([...prev, ...newSlidePages]));
    setCurrentPageIndex(startIndex);
    setActiveTab('notebook');
  };

  // Add page captured from mobile camera
  const handleAddPhotoPage = (newPage: NotebookPage) => {
    const targetIdx = pages.length;
    updatePages((prev) => renumberPages([...prev, newPage]));
    setCurrentPageIndex(targetIdx);
    setActiveTab('notebook');
    soundEngine.playSuccessChime();
  };

  // Stamp current tasks as a dedicated Planner sheet in the notebook
  const handleStampPlannerToNotebook = (currentTasks: TaskItem[]) => {
    const pending = currentTasks.filter((t) => t.status !== 'completed');
    const newPage: NotebookPage = {
      id: `page-planner-${Date.now()}`,
      pageNumber: pages.length + 1,
      title: `📅 Agenda de Tareas & Metas (${new Date().toLocaleDateString('es-ES')})`,
      subject: activeNotebook?.subject || 'Planificación Semanal',
      texture: 'grid',
      handwritingFont: false,
      content: `<h2>📅 Hoja de Entregas & Planificación</h2>
<p><em>Impreso automáticamente desde la Agenda de Lumina Notebook</em></p>
<blockquote>
  <strong>Tareas Académicas Pendientes (${pending.length}):</strong>
  <ul>
    ${pending.map((t) => `<li><strong>${t.category}:</strong> ${t.title} (Fecha: ${t.dueDate})</li>`).join('')}
  </ul>
</blockquote>
<h3>📌 Notas de Seguimiento:</h3>
<p>◻️ Revisar al inicio y al final de cada jornada de estudio.</p>`,
      drawings: [],
      stickers: [
        {
          id: `stk-plan-${Date.now()}`,
          text: `📌 Metas activas: ${pending.length} entregas pendientes.`,
          color: 'green',
          x: 60,
          y: 75,
          rotation: 2,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    updatePages((prev) => renumberPages([...prev, newPage]));
    setCurrentPageIndex(pages.length);
    setActiveTab('notebook');
  };

  // Export full notebook to PDF
  const handleExportPDF = () => {
    exportNotebookToPDF(pages, activeNotebook?.title || 'Lumina Notebook');
  };

  const handleExportNotebookPDF = (notebookToExport?: Notebook) => {
    const target = notebookToExport || activeNotebook;
    if (target) {
      exportNotebookToPDF(target.pages, target.title);
    }
  };

  // Export backup JSON
  const handleExportBackup = () => {
    exportDataBackup(pages, tasks, lectures, settings, notebooks);
  };

  // Import backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.notebooks && Array.isArray(parsed.notebooks)) {
          setNotebooks(parsed.notebooks);
          saveStoredNotebooks(parsed.notebooks);
          if (parsed.notebooks.length > 0) {
            setActiveNotebookId(parsed.notebooks[0].id);
            setPages(parsed.notebooks[0].pages);
          }
        } else if (parsed.pages) {
          setPages(parsed.pages);
        }
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.lectures) setLectures(parsed.lectures);
        if (parsed.settings) setSettings(parsed.settings);
        setIsSettingsOpen(false);
        soundEngine.playSuccessChime();
        alert('¡Copia de seguridad restaurada con éxito!');
      } catch (err) {
        console.error('Error importing backup:', err);
        alert('Error al leer el archivo de copia de seguridad.');
      }
    };
    reader.readAsText(file);
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const currentPage = pages[currentPageIndex] || pages[0];
  const canUndo = (currentPage?.drawings?.length || 0) > 0;

  return (
    <div className="flex flex-col w-screen min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      {/* Top Main Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
        notebookCount={notebooks.length}
        activeNotebookTitle={activeNotebook?.title}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 flex flex-col relative w-full overflow-hidden pb-16 md:pb-0">
        {/* Mis Cuadernos (Library / Bookshelf View) */}
        {activeTab === 'library' && (
          <div className="flex-1 w-full overflow-y-auto py-4">
            <LibraryView
              notebooks={notebooks}
              activeNotebookId={activeNotebookId}
              onSelectNotebook={handleSelectNotebook}
              onCreateNotebook={handleCreateNotebook}
              onUpdateNotebook={handleUpdateNotebook}
              onDuplicateNotebook={handleDuplicateNotebook}
              onDeleteNotebook={handleDeleteNotebook}
              onExportPDF={handleExportNotebookPDF}
            />
          </div>
        )}

        {/* 3D Notebook View */}
        {activeTab === 'notebook' && (
          <div className="flex-1 flex flex-col w-full">
            {/* Interactive Notebook Inking & Navigation Toolbar */}
            <NotebookToolbar
              currentPageIndex={currentPageIndex}
              totalPages={pages.length}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              onGoToPage={handlePageChange}
              onAddPage={handleAddPage}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage}
              onAddSticker={handleAddSticker}
              activeTool={activeTool}
              onChangeTool={setActiveTool}
              penColor={penColor}
              onChangePenColor={setPenColor}
              penWidth={penWidth}
              onChangePenWidth={setPenWidth}
              highlighterColor={highlighterColor}
              onChangeHighlighterColor={setHighlighterColor}
              currentTexture={currentPage?.texture || 'ruled'}
              onChangeTexture={handleChangeCurrentTexture}
              soundEnabled={settings.soundEnabled}
              onToggleSound={() => {
                const nextVal = !settings.soundEnabled;
                setSettings({ ...settings, soundEnabled: nextVal });
                soundEngine.enabled = nextVal;
              }}
              dualPageMode={settings.dualPageMode}
              onToggleDualPage={() =>
                setSettings({ ...settings, dualPageMode: !settings.dualPageMode })
              }
              onOpenThumbnails={() => setIsThumbnailsOpen(true)}
              onExportPDF={handleExportPDF}
              onUndoStroke={handleUndoStroke}
              onClearDrawings={handleClearDrawings}
              canUndo={canUndo}
              notebooks={notebooks}
              activeNotebookId={activeNotebookId}
              onSelectNotebook={handleSelectNotebook}
              onOpenLibrary={() => setActiveTab('library')}
            />

            {/* 3D Interactive Notebook Spread */}
            <BookContainer
              pages={pages}
              currentPageIndex={currentPageIndex}
              onPageChange={handlePageChange}
              dualPageMode={settings.dualPageMode}
              coverStyle={activeNotebook?.coverStyle || settings.coverStyle}
              activeTool={activeTool}
              penColor={penColor}
              penWidth={penWidth}
              highlighterColor={highlighterColor}
              highlighterWidth={16}
              onUpdatePage={handleUpdatePage}
            />
          </div>
        )}

        {/* Planner View */}
        {activeTab === 'planner' && (
          <div className="flex-1 w-full overflow-y-auto py-6">
            <PlannerView
              tasks={tasks}
              pages={pages}
              onUpdateTasks={setTasks}
              onNavigateToNotebookPage={(index) => {
                setCurrentPageIndex(index);
                setActiveTab('notebook');
              }}
              onStampToNotebook={handleStampPlannerToNotebook}
            />
          </div>
        )}

        {/* Audio Recorder View */}
        {activeTab === 'recorder' && (
          <div className="flex-1 w-full overflow-y-auto py-6">
            <LectureRecorderModal
              onInsertToNotebook={handleInsertLectureToNotebook}
              onCreateTasks={handleCreateTasksFromLecture}
            />
          </div>
        )}

        {/* Slide Ingestion View */}
        {activeTab === 'slides' && (
          <div className="flex-1 w-full overflow-y-auto py-6">
            <SlideConverterModal
              onAddConvertedPages={handleAddConvertedSlidePages}
              onNavigateToNotebook={(index) => {
                setCurrentPageIndex(index);
                setActiveTab('notebook');
              }}
            />
          </div>
        )}
      </main>

      {/* Page Thumbnails & Index Modal */}
      <PageThumbnailsModal
        isOpen={isThumbnailsOpen}
        onClose={() => setIsThumbnailsOpen(false)}
        pages={pages}
        currentPageIndex={currentPageIndex}
        onSelectPage={handlePageChange}
      />

      {/* Global Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={resetAllData}
      />

      {/* Local Authentication Modal (bcrypt + JWT) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Smartphones/Tablets) */}
      <MobileNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
        notebookCount={notebooks.length}
        onOpenQuickCamera={() => setIsCameraModalOpen(true)}
      />

      {/* Camera & Quick Photo Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onAddPhotoPage={handleAddPhotoPage}
        pageCount={pages.length}
        activeSubject={activeNotebook?.subject}
      />
    </div>
  );
};

export default App;
