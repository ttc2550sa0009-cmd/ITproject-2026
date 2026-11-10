import { Router } from 'express';
import * as todoController from './todoController';

export const todoRouter = Router();

todoRouter.get('/', todoController.listTodos);
todoRouter.post('/', todoController.createTodo);
todoRouter.patch('/:id', todoController.updateTodo);
todoRouter.delete('/:id', todoController.deleteTodo);
