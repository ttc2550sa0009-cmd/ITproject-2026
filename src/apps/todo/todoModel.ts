import { pool } from '../../../db';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export async function listTodos(): Promise<Todo[]> {
  const result = await pool.query<Todo>(
    'SELECT id, title, completed, created_at, updated_at FROM todo_tasks ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function createTodo(title: string): Promise<Todo> {
  const result = await pool.query<Todo>(
    'INSERT INTO todo_tasks (title, completed) VALUES ($1, false) RETURNING id, title, completed, created_at, updated_at',
    [title]
  );
  return result.rows[0];
}

export async function updateTodoCompleted(id: number, completed: boolean): Promise<Todo | null> {
  const result = await pool.query<Todo>(
    'UPDATE todo_tasks SET completed = $1, updated_at = now() WHERE id = $2 RETURNING id, title, completed, created_at, updated_at',
    [completed, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteTodo(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM todo_tasks WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
