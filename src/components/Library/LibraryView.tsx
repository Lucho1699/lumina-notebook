import React, { useState } from 'react';
import type { Notebook, CoverStyle, PaperTexture } from '../../types/notebook';
import {
  BookOpen,
  Plus,
  Search,
  FolderOpen,
  Copy,
  Trash2,
  Edit3,
  FileDown,
  Sparkles,
  Layers,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

interface LibraryViewProps {
  notebooks: Notebook[];
  activeNotebookId: string;
  onSelectNotebook: (id: string) => void;
  onCreateNotebook: (newNotebook: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNotebook: (id: string, updated: Partial<Notebook>) => void;
  onDuplicateNotebook: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
  onExportPDF: (notebook: Notebook) => void;
}

const COVER_OPTIONS: { id: CoverStyle; label: string; bg: string; border: string; accent: string }[] = [
  {
    id: 'leather',
    label: 'Cuero Rústico',
    bg: 'from-[#2c1d15] via-[#3b271d] to-[#2c1d15]',
    border: 'border-[#5a3a2b]',
    accent: 'text-amber-300',
  },
  {
    id: 'navy',
    label: 'Azul Marino',
    bg: 'from-[#0a1128] via-[#1e293b] to-[#0a1128]',
    border: 'border-[#334155]',
    accent: 'text-sky-300',
  },
  {
    id: 'emerald',
    label: 'Verde Esmeralda',
    bg: 'from-[#022c22] via-[#064e3b] to-[#022c22]',
    border: 'border-[#0f766e]',
    accent: 'text-emerald-300',
  },
  {
    id: 'amber',
    label: 'Ámbar Cálido',
    bg: 'from-[#451a03] via-[#78350f] to-[#451a03]',
    border: 'border-[#b45309]',
    accent: 'text-amber-200',
  },
  {
    id: 'obsidian',
    label: 'Obsidiana Mate',
    bg: 'from-[#09090b] via-[#18181b] to-[#09090b]',
    border: 'border-[#27272a]',
    accent: 'text-zinc-200',
  },
];

const TEXTURE_OPTIONS: { id: PaperTexture; label: string; icon: string }[] = [
  { id: 'ruled', label: 'Rayado', icon: '📝' },
  { id: 'grid', label: 'Cuadriculado', icon: '📐' },
  { id: 'dotted', label: 'Puntos', icon: '⁖' },
  { id: 'blank', label: 'Blanco', icon: '📄' },
  { id: 'vintage', label: 'Vintage', icon: '📜' },
  { id: 'dark', label: 'Pizarra', icon: '🌑' },
];

const COMMON_SUBJECT_SUGGESTGESTIONS = [
  'Matemáticas',
  'Física',
  'Química',
  'Ciencias de la Computación',
  'Bioquímica Médica',
  'Historia',
  'Literatura',
  'Idiomas',
  'General',
];

export const LibraryView: React.FC<LibraryViewProps> = ({
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onCreateNotebook,
  onUpdateNotebook,
  onDuplicateNotebook,
  onDeleteNotebook,
  onExportPDF,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);

  // New notebook form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCoverStyle, setNewCoverStyle] = useState<CoverStyle>('navy');
  const [newTexture, setNewTexture] = useState<PaperTexture>('ruled');

  // Edit notebook form state
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editCoverStyle, setEditCoverStyle] = useState<CoverStyle>('navy');
  const [editTexture, setEditTexture] = useState<PaperTexture>('ruled');

  // Extract all unique subjects
  const allSubjects = Array.from(
    new Set(notebooks.map((nb) => nb.subject.trim()).filter(Boolean))
  );

  // Filter notebooks
  const filteredNotebooks = notebooks.filter((nb) => {
    const matchesSubject =
      selectedSubject === 'all' ||
      nb.subject.trim().toLowerCase() === selectedSubject.trim().toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nb.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewSubject(allSubjects[0] || 'Matemáticas');
    setNewCoverStyle('navy');
    setNewTexture('ruled');
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || 'Nuevo Cuaderno de Estudio';
    const subject = newSubject.trim() || 'General';

    const firstPage = {
      id: `page-${Date.now()}-1`,
      pageNumber: 1,
      title: `Apunte Inicial: ${title}`,
      subject: subject,
      texture: newTexture,
      content: `<h2>📘 ${title}</h2><p>Comienza a escribir tus apuntes para <strong>${subject}</strong> aquí...</p>`,
      handwritingFont: false,
      drawings: [],
      stickers: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateNotebook({
      title,
      subject,
      coverStyle: newCoverStyle,
      defaultTexture: newTexture,
      pages: [firstPage],
      currentPageIndex: 0,
    });

    setIsCreateModalOpen(false);
    soundEngine.playSuccessChime();
  };

  const handleOpenEditModal = (notebook: Notebook) => {
    setEditingNotebook(notebook);
    setEditTitle(notebook.title);
    setEditSubject(notebook.subject);
    setEditCoverStyle(notebook.coverStyle);
    setEditTexture(notebook.defaultTexture);
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotebook) return;

    onUpdateNotebook(editingNotebook.id, {
      title: editTitle.trim() || editingNotebook.title,
      subject: editSubject.trim() || editingNotebook.subject,
      coverStyle: editCoverStyle,
      defaultTexture: editTexture,
    });

    setEditingNotebook(null);
    soundEngine.playSuccessChime();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 select-none">
      {/* Top Banner & Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-2">
              <Layers className="w-4 h-4" />
              <span>Estantería de Cuadernos & Materias</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Mis Cuadernos de Estudio
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Organiza tus apuntes por materia. Cada cuaderno cuenta con páginas ilimitadas,
              dibujo digital, post-its y paso de hoja en 3D.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Crear Nuevo Cuaderno</span>
            </button>
          </div>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Todas las Materias ({notebooks.length})
            </button>

            {allSubjects.map((sub) => {
              const count = notebooks.filter((n) => n.subject === sub).length;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSubject === sub
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cuaderno o tema..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookshelf Visual Grid */}
      <div className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotebooks.map((nb) => {
            const coverStyleData =
              COVER_OPTIONS.find((c) => c.id === nb.coverStyle) || COVER_OPTIONS[0];
            const isActive = nb.id === activeNotebookId;
            const pageCount = nb.pages.length;

            return (
              <div
                key={nb.id}
                className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-xl ${
                  isActive
                    ? 'border-amber-500/80 ring-2 ring-amber-500/30 bg-slate-900/90'
                    : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/70 hover:-translate-y-1'
                }`}
              >
                {/* 3D Realistic Book Cover Top */}
                <div
                  onClick={() => onSelectNotebook(nb.id)}
                  className={`relative p-5 h-56 bg-gradient-to-r ${coverStyleData.bg} ${coverStyleData.border} border-b cursor-pointer flex flex-col justify-between overflow-hidden`}
                >
                  {/* Bookmark Ribbon */}
                  <div className="absolute top-0 right-8 w-6 h-12 bg-red-600 rounded-b shadow-md pointer-events-none z-10 flex items-end justify-center pb-0.5">
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[8px] border-b-transparent border-t-red-700/60" />
                  </div>

                  {/* Spine binding highlight on left */}
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none" />

                  {/* Subject Tag */}
                  <div className="flex items-center gap-1.5 z-10">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 text-amber-200 border border-white/10 backdrop-blur-xs">
                      {nb.subject}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Activo
                      </span>
                    )}
                  </div>

                  {/* Book Title */}
                  <div className="z-10 my-auto py-2">
                    <h3 className="text-lg font-extrabold text-white leading-snug drop-shadow-md line-clamp-2">
                      {nb.title}
                    </h3>
                  </div>

                  {/* Cover Footer */}
                  <div className="flex items-center justify-between text-xs text-white/80 z-10 pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>{pageCount} {pageCount === 1 ? 'página' : 'páginas'}</span>
                    </span>
                    <span className="text-[11px] opacity-75 capitalize font-sans">
                      {nb.defaultTexture}
                    </span>
                  </div>
                </div>

                {/* Card Controls & Details */}
                <div className="p-4 bg-slate-950/90 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(nb.updatedAt).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onSelectNotebook(nb.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Abrir Cuaderno</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(nb)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Editar nombre, materia y portada"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateNotebook(nb.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Duplicar cuaderno completo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportPDF(nb)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-900/60 text-indigo-300 transition-colors cursor-pointer"
                      title="Descargar este cuaderno en PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteNotebook(nb.id)}
                      disabled={notebooks.length <= 1}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition-colors disabled:opacity-30 disabled:hover:bg-slate-800 cursor-pointer"
                      title={notebooks.length <= 1 ? 'No puedes eliminar el único cuaderno existente' : 'Eliminar cuaderno'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if search yields nothing */}
        {filteredNotebooks.length === 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-300">No se encontraron cuadernos</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay cuadernos que coincidan con &quot;{searchQuery}&quot; en la materia seleccionada.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Ver todos los cuadernos
            </button>
          </div>
        )}
      </div>

      {/* Modal: Create New Notebook */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Crear Nuevo Cuaderno</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreate} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Título del Cuaderno
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Cálculo Vectorial, Física Mecánica..."
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Materia / Asignatura
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ej: Matemáticas, Biología, Programación..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-amber-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SUBJECT_SUGGESTGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewSubject(sug)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                        newSubject === sug
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Color / Estilo de Portada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COVER_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewCoverStyle(c.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                        newCoverStyle === c.id
                          ? `bg-gradient-to-r ${c.bg} ${c.border} text-white ring-2 ring-amber-400/50 shadow-md`
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${c.bg} border border-white/40 shrink-0`} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Texture */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Estilo de Hoja Inicial
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TEXTURE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewTexture(t.id)}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all cursor-pointer ${
                        newTexture === t.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Crear Cuaderno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Notebook */}
      {editingNotebook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Editar Cuaderno</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNotebook(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEdit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Título del Cuaderno
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Materia / Asignatura
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-amber-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SUBJECT_SUGGESTGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setEditSubject(sug)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                        editSubject === sug
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Color / Estilo de Portada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COVER_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditCoverStyle(c.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                        editCoverStyle === c.id
                          ? `bg-gradient-to-r ${c.bg} ${c.border} text-white ring-2 ring-amber-400/50 shadow-md`
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${c.bg} border border-white/40 shrink-0`} />
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Texture */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Estilo de Papel Predeterminado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TEXTURE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditTexture(t.id)}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all cursor-pointer ${
                        editTexture === t.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNotebook(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
