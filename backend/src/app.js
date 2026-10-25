import express from 'express';

function taskId(value) {
  return /^[a-f\d]{24}$/i.test(value);
}

export function createApp(store) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api/tasks', async (_req, res) => {
    res.json(await store.list());
  });

  app.post('/api/tasks', async (req, res) => {
    const title = req.body?.title;
    if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 120) {
      return res.status(400).json({ error: 'Title must be 1–120 characters.' });
    }
    const task = await store.create(title.trim());
    return res.status(201).json(task);
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    if (!taskId(req.params.id) || typeof req.body?.completed !== 'boolean') {
      return res.status(400).json({ error: 'A valid task ID and completed value are required.' });
    }
    const task = await store.updateCompleted(req.params.id, req.body.completed);
    return task ? res.json(task) : res.status(404).json({ error: 'Task not found.' });
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    if (!taskId(req.params.id)) {
      return res.status(400).json({ error: 'A valid task ID is required.' });
    }
    const removed = await store.remove(req.params.id);
    return removed ? res.status(204).end() : res.status(404).json({ error: 'Task not found.' });
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'Invalid JSON request body.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
