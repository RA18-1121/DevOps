import express from 'express';
import { createTaskRoutes } from './routes/taskRoutes.js';

export function createApp(repository) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/tasks', createTaskRoutes(repository));

  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'Invalid JSON request body.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
