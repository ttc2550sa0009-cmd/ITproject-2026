import { Request, Response } from 'express';
import * as todoModel from './todoModel';

function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function listTodos(req: Request, res: Response): Promise<void> {
  try {
    const todos = await todoModel.listTodos();
    res.json({ data: todos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'TODOの一覧を取得できませんでした。' });
  }
}

export async function createTodo(req: Request, res: Response): Promise<void> {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    res.status(400).json({ error: 'タイトルを入力してください。' });
    return;
  }
  if (title.length > 200) {
    res.status(400).json({ error: 'タイトルは200文字以内で入力してください。' });
    return;
  }
  try {
    const todo = await todoModel.createTodo(title);
    res.status(201).json({ data: todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'TODOを登録できませんでした。' });
  }
}

export async function updateTodo(req: Request, res: Response): Promise<void> {
  const id = parseId(req);
  if (id === null) {
    res.status(404).json({ error: 'TODOが見つかりません。' });
    return;
  }
  if (typeof req.body?.completed !== 'boolean') {
    res.status(400).json({ error: '完了状態を指定してください。' });
    return;
  }
  try {
    const todo = await todoModel.updateTodoCompleted(id, req.body.completed);
    if (!todo) {
      res.status(404).json({ error: 'TODOが見つかりません。' });
      return;
    }
    res.json({ data: todo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'TODOを更新できませんでした。' });
  }
}

export async function deleteTodo(req: Request, res: Response): Promise<void> {
  const id = parseId(req);
  if (id === null) {
    res.status(404).json({ error: 'TODOが見つかりません。' });
    return;
  }
  try {
    const deleted = await todoModel.deleteTodo(id);
    if (!deleted) {
      res.status(404).json({ error: 'TODOが見つかりません。' });
      return;
    }
    res.json({ data: { id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'TODOを削除できませんでした。' });
  }
}
