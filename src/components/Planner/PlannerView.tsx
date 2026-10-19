import React, { useState } from 'react';
import type {
  TaskItem,
  NotebookPage,
} from '../../types/notebook';
import { TaskModal } from './TaskModal';
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  Flag,
  BookOpen,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ArrowRight,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';
import confetti from 'canvas-confetti';

interface PlannerViewProps {
  tasks: TaskItem[];
  pages: NotebookPage[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onNavigateToNotebookPage: (pageIndex: number) => void;
  onStampToNotebook: (tasks: TaskItem[]) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  tasks,
  pages,
  onUpdateTasks,
  onNavigateToNotebookPage,
  onStampToNotebook,
}) => {
  const [filter, setFilter] = useState<'all' | 'todo' | 'high' | 'completed'>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [notificationsGranted, setNotificationsGranted] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // Request browser notification permission for reminders
  const handleRequestNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsGranted(true);
        new Notification('Lumina Notebook', {
          body: '¡Recordatorios activados! Te avisaremos de tus entregas y exámenes.',
          icon: '/favicon.svg',
        });
        soundEngine.playSuccessChime();
      }
    }
  };

  // Toggle checklist expansion
  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle task completion
  const handleToggleTaskStatus = (task: TaskItem) => {
    const newStatus: 'todo' | 'completed' = task.status === 'completed' ? 'todo' : 'completed';
    const updated = tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t));
    onUpdateTasks(updated);

    if (newStatus === 'completed') {
      soundEngine.playSuccessChime();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  // Toggle subtask checklist item
  const handleToggleChecklistItem = (taskId: string, checkId: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const newChecklist = t.checklist.map((c) =>
        c.id === checkId ? { ...c, done: !c.done } : c
      );
      // If all subitems are done, mark task completed
      const allDone = newChecklist.length > 0 && newChecklist.every((c) => c.done);
      const nextStatus: 'todo' | 'in_progress' | 'completed' = allDone ? 'completed' : t.status;
      return {
        ...t,
        checklist: newChecklist,
        status: nextStatus,
      };
    });
    onUpdateTasks(updated);
    soundEngine.playStickerSound();
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleSaveTask = (savedTask: TaskItem) => {
    if (editingTask) {
      onUpdateTasks(tasks.map((t) => (t.id === savedTask.id ? savedTask : t)));
    } else {
      onUpdateTasks([savedTask, ...tasks]);
    }
    soundEngine.playSuccessChime();
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'todo'
        ? t.status !== 'completed'
        : filter === 'completed'
        ? t.status === 'completed'
        : t.priority === 'high' && t.status !== 'completed';

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;

    return matchesFilter && matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityPending = tasks.filter(
    (t) => t.priority === 'high' && t.status !== 'completed'
  ).length;

  const [todayStr] = useState(() => new Date().toISOString().split('T')[0]);

  // Urgent & Due Today Reminders
  const dueTodayTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate === todayStr
  );
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate < todayStr
  );

  // Helper for due date badge
  const getDueBadge = (dueDate: string, dueTime?: string) => {
    if (dueDate < todayStr) {
      return { text: '¡Vencida!', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
    if (dueDate === todayStr) {
      return { text: `Hoy ${dueTime || ''}`, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold' };
    }
    const diffDays = Math.ceil(
      (new Date(dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
    );
    if (diffDays === 1) {
      return { text: 'Mañana', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
    }
    return { text: `En ${diffDays} días`, color: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

  const allCategories = Array.from(new Set(tasks.map((t) => t.category)));

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <CalendarCheck className="w-4 h-4" />
              <span>Agenda Académica & Planificador</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Gestión de Entregas, Exámenes & Tareas
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Organiza tus deberes y conéctalos directamente con las páginas y apuntes de tu
              cuaderno.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>

            <button
              type="button"
              onClick={() => onStampToNotebook(tasks)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              title="Crea una página de agenda dentro del cuaderno 3D con tus tareas pendientes"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Estampar en Cuaderno</span>
            </button>
          </div>
        </div>

        {/* Stats counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 block">Total Tareas</span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">{totalTasks}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-amber-400 block">Por Entregar</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">{pendingTasks}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-rose-400 block">Urgentes / Alta</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-0.5 block">{highPriorityPending}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-medium text-emerald-400 block">Completadas</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">{completedTasks}</span>
          </div>
        </div>
      </div>

      {/* Reminders & Urgent Notifications Banner */}
      {(dueTodayTasks.length > 0 || overdueTasks.length > 0 || !notificationsGranted) && (
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-300">Avisos & Recordatorios</h4>
                {overdueTasks.length > 0 && (
                  <span className="text-[10px] bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {overdueTasks.length} vencidas
                  </span>
                )}
                {dueTodayTasks.length > 0 && (
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {dueTodayTasks.length} para hoy
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {overdueTasks.length > 0
                  ? `Tienes ${overdueTasks.length} entrega(s) pendiente(s) fuera de plazo.`
                  : dueTodayTasks.length > 0
                  ? `Tienes ${dueTodayTasks.length} tarea(s) con fecha límite para hoy.`
                  : 'Mantén tus recordatorios activos para no perder ninguna entrega.'}
              </p>
            </div>
          </div>

          {!notificationsGranted && (
            <button
              type="button"
              onClick={handleRequestNotifications}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Activar Notificaciones
            </button>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-md">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('todo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'todo'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Pendientes ({pendingTasks})
          </button>

          <button
            type="button"
            onClick={() => setFilter('high')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'high'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Urgentes ({highPriorityPending})
          </button>

          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Completadas ({completedTasks})
          </button>

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todas ({totalTasks})
          </button>
        </div>

        {/* Search & Subject filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">Todas las materias</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">¡Todo al día!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hay tareas en esta sección. Crea una nueva tarea o relájate.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isExpanded = expandedTaskIds.has(task.id);
            const dueBadge = getDueBadge(task.dueDate, task.dueTime);
            const linkedPage = pages.find((p) => p.id === task.linkedPageId);
            const totalSub = task.checklist?.length || 0;
            const completedSub = task.checklist?.filter((c) => c.done).length || 0;

            return (
              <div
                key={task.id}
                className={`group bg-slate-900 border rounded-2xl p-4 md:p-5 transition-all shadow-md ${
                  isCompleted
                    ? 'border-slate-800/60 opacity-60 bg-slate-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-amber-400 bg-slate-950'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    {/* Title & info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm md:text-base font-semibold text-white ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Flag className="w-2.5 h-2.5" />
                          {task.priority === 'high'
                            ? 'Alta'
                            : task.priority === 'medium'
                            ? 'Media'
                            : 'Baja'}
                        </span>

                        {/* Due badge */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${dueBadge.color}`}
                        >
                          {dueBadge.text}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Footer tags */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                          {task.category}
                        </span>

                        {/* Linked Page shortcut */}
                        {linkedPage && (
                          <button
                            type="button"
                            onClick={() => {
                              const pIdx = pages.findIndex((p) => p.id === linkedPage.id);
                              if (pIdx !== -1) {
                                onNavigateToNotebookPage(pIdx);
                              }
                            }}
                            className="text-[11px] font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Abrir hoja de apuntes en el cuaderno"
                          >
                            <BookOpen className="w-3 h-3 text-amber-400" />
                            <span>Pág. {linkedPage.pageNumber}: {linkedPage.title}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}

                        {/* Checklist progress pill */}
                        {totalSub > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(task.id)}
                            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>
                              Subtareas ({completedSub}/{totalSub})
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit / Delete */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar Tarea"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Eliminar Tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtask checklist drawer */}
                {isExpanded && task.checklist && task.checklist.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 pl-9">
                    {task.checklist.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleToggleChecklistItem(task.id, c.id)}
                        className="flex items-center gap-2.5 text-xs cursor-pointer group/item text-slate-300 hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={c.done}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-amber-500 cursor-pointer"
                        />
                        <span className={c.done ? 'line-through text-slate-500' : ''}>
                          {c.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        editingTask={editingTask}
        pages={pages}
      />
    </div>
  );
};
