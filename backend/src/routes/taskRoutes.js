import { Router } from 'express';
import { createTaskController } from '../controllers/taskController.js';

export function createTaskRoutes(repository) {
  const router = Router();
  const controller = createTaskController(repository);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id', controller.updateCompleted);
  router.delete('/:id', controller.remove);

  return router;
}
