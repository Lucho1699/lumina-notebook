import { jsPDF } from 'jspdf';
import type { Notebook, NotebookPage, TaskItem, AudioLecture, NotebookSettings } from '../types/notebook';

export const exportNotebookToPDF = (pages: NotebookPage[], notebookTitle: string = 'Lumina Notebook') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Cover Page
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text(notebookTitle, 105, 120, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(148, 163, 184);
  doc.text('Cuaderno Digital Interactivo & Apuntes Académicos', 105, 135, { align: 'center' });
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 145, { align: 'center' });

  // Each page in notebook
  pages.forEach((page) => {
    doc.addPage();

    // Subtle paper background
    doc.setFillColor(253, 252, 247);
    doc.rect(0, 0, 210, 297, 'F');

    // Page header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 15, 180, 16, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, 15, 180, 16, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text(page.title, 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Página ${page.pageNumber} • ${page.subject}`, 190, 25, { align: 'right' });

    let currentY = 40;

    // Slide banner if exists
    if (page.slideTitle) {
      doc.setFillColor(238, 242, 255);
      doc.rect(15, currentY, 180, 22, 'F');
      doc.setTextColor(67, 56, 202);
      doc.setFontSize(11);
      doc.text(`Diapositiva: ${page.slideTitle}`, 20, currentY + 8);

      if (page.slideNotes && page.slideNotes.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(page.slideNotes.slice(0, 2).join(' | '), 20, currentY + 16);
      }
      currentY += 28;
    }

    // Strip HTML tags for clean text output in PDF
    const cleanContent = page.content
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<[^>]+>/gm, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);

    cleanContent.forEach(line => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 25;
      }
      const splitLines = doc.splitTextToSize(line, 175);
      doc.text(splitLines, 20, currentY);
      currentY += (splitLines.length * 6) + 2;
    });

    // Sticky notes in PDF
    if (page.stickers && page.stickers.length > 0) {
      page.stickers.forEach((stk) => {
        if (currentY > 260) {
          doc.addPage();
          currentY = 25;
        }
        doc.setFillColor(254, 240, 138);
        doc.rect(20, currentY, 170, 14, 'F');
        doc.setTextColor(133, 77, 14);
        doc.setFontSize(9);
        doc.text(`[Nota Adhesiva]: ${stk.text}`, 24, currentY + 8);
        currentY += 18;
      });
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Lumina Notebook • ${page.pageNumber}`, 105, 290, { align: 'center' });
  });

  doc.save(`${notebookTitle.toLowerCase().replace(/\s+/g, '_')}_completo.pdf`);
};

export const exportDataBackup = (
  pages: NotebookPage[],
  tasks: TaskItem[],
  lectures: AudioLecture[],
  settings: NotebookSettings,
  notebooks?: Notebook[]
) => {
  const backup = {
    app: 'Lumina Notebook',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    pages,
    tasks,
    lectures,
    settings,
    notebooks,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lumina_notebook_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
