import { describe, it, expect } from 'vitest';
import type { TaskItem } from '../types/notebook';

describe('Agenda & Reminders Logic', () => {
  const todayStr = '2026-10-18';

  const mockTasks: TaskItem[] = [
    {
      id: 't-overdue',
      title: 'Entrega Atrasada',
      dueDate: '2026-10-15',
      category: 'Historia',
      priority: 'high',
      status: 'todo',
      checklist: [],
      createdAt: 100,
    },
    {
      id: 't-today',
      title: 'Examen Hoy',
      dueDate: '2026-10-18',
      dueTime: '15:00',
      category: 'Cálculo',
      priority: 'high',
      status: 'todo',
      checklist: [{ id: 'c1', text: 'Repasar integrales', done: true }],
      createdAt: 200,
    },
    {
      id: 't-future',
      title: 'Proyecto Próxima Semana',
      dueDate: '2026-10-25',
      category: 'Física',
      priority: 'medium',
      status: 'todo',
      checklist: [],
      createdAt: 300,
    },
    {
      id: 't-completed',
      title: 'Tarea Terminada',
      dueDate: '2026-10-15',
      category: 'Historia',
      priority: 'low',
      status: 'completed',
      checklist: [],
      createdAt: 400,
    },
  ];

  it('correctly detects overdue pending tasks', () => {
    const overdue = mockTasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr);
    expect(overdue.length).toBe(1);
    expect(overdue[0].id).toBe('t-overdue');
  });

  it('correctly detects tasks due today', () => {
    const dueToday = mockTasks.filter((t) => t.status !== 'completed' && t.dueDate === todayStr);
    expect(dueToday.length).toBe(1);
    expect(dueToday[0].id).toBe('t-today');
  });

  it('filters tasks by category', () => {
    const historyTasks = mockTasks.filter((t) => t.category === 'Historia');
    expect(historyTasks.length).toBe(2);
  });
});
