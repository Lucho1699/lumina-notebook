export type PaperTexture = 'ruled' | 'grid' | 'dotted' | 'blank' | 'vintage' | 'dark';

export type CoverStyle = 'leather' | 'navy' | 'emerald' | 'amber' | 'obsidian';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser';
  color: string;
  width: number;
  points: DrawingPoint[];
}

export interface StickerItem {
  id: string;
  text: string;
  color: 'yellow' | 'pink' | 'blue' | 'green' | 'purple';
  x: number;
  y: number;
  rotation: number;
}

export interface NotebookPage {
  id: string;
  pageNumber: number;
  title: string;
  subject: string;
  texture: PaperTexture;
  content: string;
  handwritingFont: boolean;
  slideImage?: string;
  slideTitle?: string;
  slideNotes?: string[];
  drawings: DrawingStroke[];
  stickers: StickerItem[];
  audioRecordingId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  linkedPageId?: string;
  checklist: ChecklistItem[];
  createdAt: number;
}

export interface AudioLecture {
  id: string;
  title: string;
  date: string;
  duration: number; // in seconds
  audioBlobUrl?: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  linkedPageId?: string;
}

export interface NotebookSettings {
  soundEnabled: boolean;
  defaultTexture: PaperTexture;
  coverStyle: CoverStyle;
  dualPageMode: boolean; // desktop 2-page spread vs 1-page mobile
  showGridLines: boolean;
  penColor: string;
  penWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
}

export interface Notebook {
  id: string;
  title: string;
  subject: string;
  coverStyle: CoverStyle;
  defaultTexture: PaperTexture;
  pages: NotebookPage[];
  currentPageIndex?: number;
  createdAt: number;
  updatedAt: number;
}

export type ActiveTab = 'library' | 'notebook' | 'planner' | 'recorder' | 'slides';
