import { describe, it, expect } from 'vitest';

describe('PDF & Presentation Slide Ingestion Logic', () => {
  it('safely filters string text items from mixed PDF text content', () => {
    // pdfjs getTextContent can return TextItem or TextMarkedContent
    const mockPdfItems: any[] = [
      { str: 'Título de la Cátedra' },
      { id: 'marked-content', type: 'beginMarkedContent' }, // No 'str' property
      { str: '   ' }, // Whitespace only
      { str: 'Punto Clave 1: Dinámica Celular' },
      { str: 'Punto Clave 2: Mitosis y Meiosis' },
    ];

    const safeTextItems = mockPdfItems
      .filter((item: any) => typeof item.str === 'string' && item.str.trim().length > 0)
      .map((item: any) => item.str.trim());

    expect(safeTextItems.length).toBe(3);
    expect(safeTextItems[0]).toBe('Título de la Cátedra');
    expect(safeTextItems[1]).toBe('Punto Clave 1: Dinámica Celular');
    expect(safeTextItems[2]).toBe('Punto Clave 2: Mitosis y Meiosis');
  });

  it('validates supported presentation file types', () => {
    const isSupported = (filename: string, mimeType: string) => {
      return (
        mimeType === 'application/pdf' ||
        filename.endsWith('.pdf') ||
        mimeType.startsWith('image/')
      );
    };

    expect(isSupported('slides.pdf', 'application/pdf')).toBe(true);
    expect(isSupported('slide1.png', 'image/png')).toBe(true);
    expect(isSupported('document.pdf', '')).toBe(true);
    expect(isSupported('virus.exe', 'application/octet-stream')).toBe(false);
  });
});
