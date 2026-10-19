import { describe, it, expect } from 'vitest';
import type { TaskItem } from '../types/notebook';

describe('Planner and Task Logic', () => {
  const mockTasks: TaskItem[] = [
    {
      id: 't-1',
      title: 'Entrega Laboratorio de Física',
      dueDate: '2026-10-20',
      category: 'Física',
      priority: 'high',
      status: 'todo',
      checklist: [
        { id: 'c-1', text: 'Calcular incertidumbre', done: true },
        { id: 'c-2', text: 'Imprimir gráficas', done: false },
      ],
      createdAt: 1000,
    },
    {
      id: 't-2',
      title: 'Lectura de Historia',
      dueDate: '2026-10-22',
      category: 'Historia',
      priority: 'low',
      status: 'completed',
      checklist: [{ id: 'c-3', text: 'Resumen', done: true }],
      createdAt: 1000,
    },
    {
      id: 't-3',
      title: 'Examen de Cálculo',
      dueDate: '2026-10-19',
      category: 'Matemáticas',
      priority: 'high',
      status: 'in_progress',
      checklist: [],
      createdAt: 1000,
    },
  ];

  it('filters pending tasks properly', () => {
    const pending = mockTasks.filter((t) => t.status !== 'completed');
    expect(pending.length).toBe(2);
  });

  it('filters completed tasks properly', () => {
    const completed = mockTasks.filter((t) => t.status === 'completed');
    expect(completed.length).toBe(1);
    expect(completed[0].id).toBe('t-2');
  });

  it('filters high priority pending tasks', () => {
    const highPending = mockTasks.filter(
      (t) => t.priority === 'high' && t.status !== 'completed'
    );
    expect(highPending.length).toBe(2);
  });

  it('calculates checklist completion progress correctly', () => {
    const task = mockTasks[0];
    const total = task.checklist.length;
    const completed = task.checklist.filter((c) => c.done).length;
    const percent = (completed / total) * 100;
    expect(total).toBe(2);
    expect(completed).toBe(1);
    expect(percent).toBe(50);
  });
});
