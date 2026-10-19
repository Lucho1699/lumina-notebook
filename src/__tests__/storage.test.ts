import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadStoredPages,
  saveStoredPages,
  loadStoredTasks,
  saveStoredTasks,
  loadStoredSettings,
  saveStoredSettings,
} from '../utils/storage';
import type { NotebookPage, TaskItem, NotebookSettings } from '../types/notebook';

// In-memory mock for localStorage in Node test environment
const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
});

describe('LocalStorage Storage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads sample pages by default when localStorage is empty', () => {
    const pages = loadStoredPages();
    expect(pages).toBeDefined();
    expect(pages.length).toBeGreaterThanOrEqual(1);
    expect(pages[0].title).toContain('Bienvenido a Lumina Notebook');
  });

  it('saves and loads custom notebook pages', () => {
    const customPages: NotebookPage[] = [
      {
        id: 'test-p-1',
        pageNumber: 1,
        title: 'Página de Prueba',
        subject: 'Testing',
        texture: 'grid',
        content: '<p>Contenido de prueba</p>',
        handwritingFont: false,
        drawings: [],
        stickers: [],
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    saveStoredPages(customPages);
    const loaded = loadStoredPages();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('test-p-1');
    expect(loaded[0].title).toBe('Página de Prueba');
  });

  it('saves and loads academic tasks', () => {
    const customTasks: TaskItem[] = [
      {
        id: 'task-test-1',
        title: 'Estudiar para examen',
        dueDate: '2026-10-25',
        category: 'Matemáticas',
        priority: 'high',
        status: 'todo',
        checklist: [{ id: 'chk-1', text: 'Repasar derivadas', done: false }],
        createdAt: 2000,
      },
    ];

    saveStoredTasks(customTasks);
    const loaded = loadStoredTasks();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('task-test-1');
    expect(loaded[0].checklist.length).toBe(1);
  });

  it('saves and loads settings preferences correctly', () => {
    const customSettings: NotebookSettings = {
      soundEnabled: false,
      defaultTexture: 'vintage',
      coverStyle: 'emerald',
      dualPageMode: false,
      showGridLines: false,
      penColor: '#ff0000',
      penWidth: 5,
      highlighterColor: '#00ff00',
      highlighterWidth: 20,
    };

    saveStoredSettings(customSettings);
    const loaded = loadStoredSettings();
    expect(loaded.soundEnabled).toBe(false);
    expect(loaded.defaultTexture).toBe('vintage');
    expect(loaded.coverStyle).toBe('emerald');
  });
});
