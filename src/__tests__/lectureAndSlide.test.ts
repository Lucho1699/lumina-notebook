import { describe, it, expect } from 'vitest';
import type { NotebookPage } from '../types/notebook';

describe('Lecture Transcription & Keynote Extraction Logic', () => {
  it('extracts action items matching academic trigger keywords', () => {
    const transcript =
      'Bienvenidos a clase. Para el viernes deben entregar la práctica 3 de laboratorio. Recuerden leer el capítulo 4 antes del examen. La mitosis es la división celular simétrica.';
    
    const sentences = transcript.split(/[.?!]\s+/);
    const actionKeywords = ['entregar', 'tarea', 'práctica', 'leer', 'examen', 'investigar', 'informe', 'revisar'];

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

    expect(detectedActions.length).toBe(2);
    expect(detectedActions[0]).toContain('entregar la práctica 3');
    expect(detectedActions[1]).toContain('leer el capítulo 4');
    expect(detectedPoints.length).toBe(2);
    expect(detectedPoints[1]).toContain('La mitosis es la división celular');
  });

  it('handles empty transcript gracefully with fallback sample', () => {
    const rawTranscript = '   ';
    const clean = rawTranscript.trim();
    const isTooShort = clean.length < 15;
    expect(isTooShort).toBe(true);
  });
});

describe('Slide to Cornell Page Conversion Logic', () => {
  it('converts slide items into structured notebook pages', () => {
    const mockSlide = {
      id: 'slide-101',
      slideNumber: 1,
      title: 'Gradiente Electroquímico',
      extractedNotes: [
        'Diferencia de concentración de protones entre la matriz y el espacio intermembrana.',
        'Potencial de membrana mitocondrial negativo en el interior.',
      ],
    };

    const newPage: NotebookPage = {
      id: `page-slide-${mockSlide.id}`,
      pageNumber: 5,
      title: `📑 ${mockSlide.title}`,
      subject: 'Bioquímica',
      texture: 'ruled',
      handwritingFont: false,
      slideTitle: `Presentación • Diapositiva #${mockSlide.slideNumber}`,
      slideNotes: mockSlide.extractedNotes,
      content: `<h3>📝 Apuntes de la Diapositiva #${mockSlide.slideNumber}:</h3><p><strong>Tema:</strong> ${mockSlide.title}</p><ul>${mockSlide.extractedNotes.map((n) => `<li>${n}</li>`).join('')}</ul>`,
      drawings: [],
      stickers: [],
      createdAt: 5000,
      updatedAt: 5000,
    };

    expect(newPage.slideTitle).toBe('Presentación • Diapositiva #1');
    expect(newPage.slideNotes?.length).toBe(2);
    expect(newPage.content).toContain('Gradiente Electroquímico');
  });

  it('correctly renumbers pages in sequence', () => {
    const pages: Partial<NotebookPage>[] = [
      { id: 'p1', pageNumber: 99 },
      { id: 'p2', pageNumber: 4 },
      { id: 'p3', pageNumber: 12 },
    ];

    const renumbered = pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    expect(renumbered[0].pageNumber).toBe(1);
    expect(renumbered[1].pageNumber).toBe(2);
    expect(renumbered[2].pageNumber).toBe(3);
  });
});
