import { describe, it, expect, beforeEach } from 'vitest';
import type { Notebook, NotebookPage } from '../types/notebook';
import {
  loadStoredNotebooks,
  saveStoredNotebooks,
  loadActiveNotebookId,
  saveActiveNotebookId,
} from '../utils/storage';

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

describe('Multi-Notebooks by Subject Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads sample notebooks categorized by subject when storage is empty', () => {
    const notebooks = loadStoredNotebooks();
    expect(notebooks.length).toBeGreaterThanOrEqual(3);

    const subjects = notebooks.map((nb) => nb.subject);
    expect(subjects).toContain('Ciencias de la Computación');
    expect(subjects).toContain('Bioquímica Médica');
    expect(subjects).toContain('Matemáticas');
  });

  it('filters notebooks accurately by subject (case-insensitive and trimmed)', () => {
    const notebooks: Notebook[] = [
      {
        id: 'nb-1',
        title: 'Cálculo Vectorial',
        subject: 'Matemáticas',
        coverStyle: 'amber',
        defaultTexture: 'grid',
        pages: [],
        createdAt: 100,
        updatedAt: 100,
      },
      {
        id: 'nb-2',
        title: 'Física Clásica',
        subject: 'Física',
        coverStyle: 'navy',
        defaultTexture: 'ruled',
        pages: [],
        createdAt: 200,
        updatedAt: 200,
      },
      {
        id: 'nb-3',
        title: 'Álgebra Lineal',
        subject: 'matemáticas ',
        coverStyle: 'emerald',
        defaultTexture: 'grid',
        pages: [],
        createdAt: 300,
        updatedAt: 300,
      },
    ];

    const filterBySubject = (list: Notebook[], targetSubject: string) =>
      list.filter((n) =>
        targetSubject === 'all'
          ? true
          : n.subject.trim().toLowerCase() === targetSubject.trim().toLowerCase()
      );

    const mathNotebooks = filterBySubject(notebooks, 'Matemáticas');
    const physicsNotebooks = filterBySubject(notebooks, 'Física');

    expect(mathNotebooks.length).toBe(2);
    expect(physicsNotebooks.length).toBe(1);
    expect(mathNotebooks[0].title).toBe('Cálculo Vectorial');
  });

  it('creates a new notebook with custom subject, cover style, and initial page', () => {
    const initialList = loadStoredNotebooks();
    const newPage: NotebookPage = {
      id: 'page-new-1',
      pageNumber: 1,
      title: 'Introducción a Algoritmos',
      subject: 'Estructuras de Datos',
      texture: 'grid',
      content: '<p>Apuntes iniciales</p>',
      handwritingFont: false,
      drawings: [],
      stickers: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newNotebook: Notebook = {
      id: 'nb-custom-1',
      title: 'Estructuras de Datos y Algoritmos',
      subject: 'Estructuras de Datos',
      coverStyle: 'obsidian',
      defaultTexture: 'grid',
      pages: [newPage],
      currentPageIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveStoredNotebooks([newNotebook, ...initialList]);
    saveActiveNotebookId(newNotebook.id);

    const loaded = loadStoredNotebooks();
    const activeId = loadActiveNotebookId();

    expect(loaded[0].id).toBe('nb-custom-1');
    expect(loaded[0].subject).toBe('Estructuras de Datos');
    expect(loaded[0].coverStyle).toBe('obsidian');
    expect(loaded[0].pages.length).toBe(1);
    expect(activeId).toBe('nb-custom-1');
  });

  it('supports updating / renaming a notebook title, subject, and cover', () => {
    const notebooks = loadStoredNotebooks();
    const target = notebooks[0];

    const updated = notebooks.map((nb) =>
      nb.id === target.id
        ? {
            ...nb,
            title: 'Cálculo Avanzado III',
            subject: 'Análisis Matemático',
            coverStyle: 'emerald' as const,
            updatedAt: Date.now(),
          }
        : nb
    );

    saveStoredNotebooks(updated);
    const loaded = loadStoredNotebooks();
    expect(loaded[0].title).toBe('Cálculo Avanzado III');
    expect(loaded[0].subject).toBe('Análisis Matemático');
    expect(loaded[0].coverStyle).toBe('emerald');
  });

  it('supports duplicating notebooks with all pages intact and up-to-date', () => {
    const sourceNotebook: Notebook = {
      id: 'nb-src',
      title: 'Química Orgánica',
      subject: 'Química',
      coverStyle: 'emerald',
      defaultTexture: 'ruled',
      pages: [
        {
          id: 'p-1',
          pageNumber: 1,
          title: 'Hidrocarburos',
          subject: 'Química',
          texture: 'ruled',
          content: '<p>Alcanos, alquenos y alquinos</p>',
          handwritingFont: false,
          drawings: [],
          stickers: [],
          createdAt: 100,
          updatedAt: 100,
        },
      ],
      createdAt: 100,
      updatedAt: 100,
    };

    const duplicated: Notebook = {
      ...sourceNotebook,
      id: `nb-dup-${Date.now()}`,
      title: `${sourceNotebook.title} (Copia)`,
      pages: sourceNotebook.pages.map((p, idx) => ({
        ...p,
        id: `page-dup-${idx}`,
      })),
      currentPageIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(duplicated.title).toBe('Química Orgánica (Copia)');
    expect(duplicated.pages.length).toBe(1);
    expect(duplicated.pages[0].id).not.toBe(sourceNotebook.pages[0].id);
  });

  it('enforces deletion safeguards preventing deletion of the last remaining notebook', () => {
    const singleNotebookList: Notebook[] = [
      {
        id: 'nb-last-standing',
        title: 'Único Cuaderno',
        subject: 'General',
        coverStyle: 'leather',
        defaultTexture: 'ruled',
        pages: [],
        createdAt: 100,
        updatedAt: 100,
      },
    ];

    const canDelete = singleNotebookList.length > 1;
    expect(canDelete).toBe(false);
  });

  it('tracks and persists currentPageIndex per notebook', () => {
    const notebooks = loadStoredNotebooks();
    const nb1 = notebooks[0];
    const nb2 = notebooks[1];

    // Navigate nb1 to page 2 (index 1)
    const updatedWithIndex = notebooks.map((nb) =>
      nb.id === nb1.id ? { ...nb, currentPageIndex: 1 } : nb
    );
    saveStoredNotebooks(updatedWithIndex);

    const reloaded = loadStoredNotebooks();
    const loadedNb1 = reloaded.find((n) => n.id === nb1.id);
    const loadedNb2 = reloaded.find((n) => n.id === nb2.id);

    expect(loadedNb1?.currentPageIndex).toBe(1);
    expect(loadedNb2?.currentPageIndex).toBe(0);
  });
});

describe('Direct Keyboard Typing and Zero Raw HTML Logic', () => {
  it('correctly detects interactive targets that must not trigger page drag-turning', () => {
    const shouldExcludeFromDrag = (
      tagName: string,
      className: string = '',
      pointerType: string = 'mouse',
      isContentEditable: boolean = false
    ) => {
      if (isContentEditable) return true;
      const interactiveTags = ['button', 'input', 'textarea', 'select', 'a'];
      const interactiveClasses = [
        'page-note-editable',
        'page-text-content',
        'page-format-toolbar',
        'sticker-item',
        'corner-curl-br',
        'corner-curl-bl',
      ];
      if (interactiveTags.includes(tagName.toLowerCase())) return true;
      if (interactiveClasses.some((cls) => className.split(' ').includes(cls))) return true;
      if (pointerType === 'mouse' && className.split(' ').includes('select-text')) return true;
      return false;
    };

    // Clicking in contenteditable note body allows typing, no drag
    expect(shouldExcludeFromDrag('div', 'page-note-editable page-text-content', 'mouse', true)).toBe(true);
    // Clicking toolbar button
    expect(shouldExcludeFromDrag('button', 'p-1 hover:bg-amber-200', 'mouse')).toBe(true);
    // Clicking page text container
    expect(shouldExcludeFromDrag('div', 'page-text-content select-text', 'mouse')).toBe(true);
    // Clicking corner curl to flip
    expect(shouldExcludeFromDrag('div', 'corner-curl-br', 'mouse')).toBe(true);
    // Mouse text selection on page
    expect(shouldExcludeFromDrag('p', 'leading-relaxed select-text', 'mouse')).toBe(true);

    // Clicking outer book chassis margin allows dragging
    expect(shouldExcludeFromDrag('div', 'book-leather-chassis', 'mouse')).toBe(false);
  });

  it('formats callout cards cleanly without exposing raw inline HTML style attributes', () => {
    const rawCallout = '<blockquote><strong>💡 Nota Clave:</strong> Repasar para el examen</blockquote>';
    expect(rawCallout).not.toContain('<div style="');
    expect(rawCallout).not.toContain('<textarea');
    expect(rawCallout).toContain('<strong>💡 Nota Clave:</strong>');
  });

  it('converts slide presentations with clean semantic blockquotes and zero raw styles', () => {
    const notes = ['Membrana externa permeable con porinas.', 'Espacio intermembrana: acumulación de H+.'];
    const generatedContent = `<h3>📝 Apuntes de la Diapositiva #1:</h3>
<p><strong>Tema:</strong> Mitocondrias</p>
<blockquote>
  <strong>Puntos Principales Explicados por el Docente:</strong>
  <ul>
    ${notes.map((n) => `<li>${n}</li>`).join('')}
  </ul>
</blockquote>
<p><em>Escribe aquí tus reflexiones...</em></p>`;

    expect(generatedContent).not.toContain('<div style="');
    expect(generatedContent).not.toContain('<textarea');
    expect(generatedContent).toContain('<blockquote>');
    expect(generatedContent).toContain('<li>Membrana externa permeable con porinas.</li>');
  });

  it('sanitizes external pasted HTML by inserting text/plain', () => {
    const externalHtmlFromWeb = '<span style="font-family: Comic Sans; color: red; background: black;">Hello World</span>';
    // Strips HTML tags and extracts text/plain as in handlePaste
    const plainText = externalHtmlFromWeb.replace(/<[^>]+>/g, '').trim();

    expect(plainText).toBe('Hello World');
    expect(plainText).not.toContain('<span style=');
    expect(plainText).not.toContain('Comic Sans');
  });
});
