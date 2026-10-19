import type { Notebook, NotebookPage, TaskItem, AudioLecture, NotebookSettings } from '../types/notebook';
import { samplePages, sampleNotebooks, sampleTasks, sampleLectures, initialSettings } from './sampleData';

const KEYS = {
  NOTEBOOKS: 'lumina_notebooks_list_v1',
  ACTIVE_NOTEBOOK_ID: 'lumina_active_notebook_id_v1',
  PAGES: 'lumina_notebook_pages_v1',
  TASKS: 'lumina_notebook_tasks_v1',
  LECTURES: 'lumina_notebook_lectures_v1',
  SETTINGS: 'lumina_notebook_settings_v1',
  CURRENT_PAGE_INDEX: 'lumina_notebook_current_page_v1',
};

export const loadStoredNotebooks = (): Notebook[] => {
  try {
    const raw = localStorage.getItem(KEYS.NOTEBOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading notebooks from localStorage:', e);
  }

  // Check if legacy pages exist in localStorage to migrate into first notebook
  try {
    const legacyPagesRaw = localStorage.getItem(KEYS.PAGES);
    if (legacyPagesRaw) {
      const legacyPages = JSON.parse(legacyPagesRaw);
      if (Array.isArray(legacyPages) && legacyPages.length > 0) {
        const migrated = [...sampleNotebooks];
        migrated[0] = {
          ...migrated[0],
          pages: legacyPages,
        };
        return migrated;
      }
    }
  } catch {
    // ignore
  }

  return sampleNotebooks;
};

export const saveStoredNotebooks = (notebooks: Notebook[]): void => {
  try {
    localStorage.setItem(KEYS.NOTEBOOKS, JSON.stringify(notebooks));
  } catch (e) {
    console.error('Error saving notebooks to localStorage:', e);
  }
};

export const loadActiveNotebookId = (): string => {
  try {
    const id = localStorage.getItem(KEYS.ACTIVE_NOTEBOOK_ID);
    if (id) return id;
  } catch {
    // ignore
  }
  return sampleNotebooks[0].id;
};

export const saveActiveNotebookId = (id: string): void => {
  try {
    localStorage.setItem(KEYS.ACTIVE_NOTEBOOK_ID, id);
  } catch {
    // ignore
  }
};

export const loadStoredPages = (): NotebookPage[] => {
  try {
    const raw = localStorage.getItem(KEYS.PAGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const notebooks = loadStoredNotebooks();
    const activeId = loadActiveNotebookId();
    const activeNb = notebooks.find((n) => n.id === activeId) || notebooks[0];
    if (activeNb && activeNb.pages && activeNb.pages.length > 0) {
      return activeNb.pages;
    }
  } catch (e) {
    console.error('Error loading pages from localStorage:', e);
  }
  return samplePages;
};

export const saveStoredPages = (pages: NotebookPage[]): void => {
  try {
    localStorage.setItem(KEYS.PAGES, JSON.stringify(pages));
    // Also sync with active notebook in notebooks list if present
    const raw = localStorage.getItem(KEYS.NOTEBOOKS);
    if (raw) {
      const notebooks: Notebook[] = JSON.parse(raw);
      const activeId = localStorage.getItem(KEYS.ACTIVE_NOTEBOOK_ID) || notebooks[0]?.id;
      if (Array.isArray(notebooks) && activeId) {
        const updated = notebooks.map((nb) =>
          nb.id === activeId ? { ...nb, pages, updatedAt: Date.now() } : nb
        );
        localStorage.setItem(KEYS.NOTEBOOKS, JSON.stringify(updated));
      }
    }
  } catch (e) {
    console.error('Error saving pages to localStorage:', e);
  }
};

export const loadStoredTasks = (): TaskItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading tasks:', e);
  }
  return sampleTasks;
};

export const saveStoredTasks = (tasks: TaskItem[]): void => {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

export const loadStoredLectures = (): AudioLecture[] => {
  try {
    const raw = localStorage.getItem(KEYS.LECTURES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading lectures:', e);
  }
  return sampleLectures;
};

export const saveStoredLectures = (lectures: AudioLecture[]): void => {
  try {
    localStorage.setItem(KEYS.LECTURES, JSON.stringify(lectures));
  } catch (e) {
    console.error('Error saving lectures:', e);
  }
};

export const loadStoredSettings = (): NotebookSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...initialSettings, ...parsed };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return initialSettings;
};

export const saveStoredSettings = (settings: NotebookSettings): void => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

export const loadCurrentPageIndex = (): number => {
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_PAGE_INDEX);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch {
    // ignore
  }
  return 0;
};

export const saveCurrentPageIndex = (index: number): void => {
  try {
    localStorage.setItem(KEYS.CURRENT_PAGE_INDEX, index.toString());
  } catch {
    // ignore
  }
};

export const resetAllData = () => {
  localStorage.removeItem(KEYS.NOTEBOOKS);
  localStorage.removeItem(KEYS.ACTIVE_NOTEBOOK_ID);
  localStorage.removeItem(KEYS.PAGES);
  localStorage.removeItem(KEYS.TASKS);
  localStorage.removeItem(KEYS.LECTURES);
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.CURRENT_PAGE_INDEX);
  window.location.reload();
};
