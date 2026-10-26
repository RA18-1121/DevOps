function validTaskId(value) {
  return /^[a-f\d]{24}$/i.test(value);
}

export function createTaskController(repository) {
  return {
    list: async (_req, res) => {
      res.json(await repository.list());
    },

    create: async (req, res) => {
      const title = req.body?.title;
      if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 120) {
        return res.status(400).json({ error: 'Title must be 1–120 characters.' });
      }
      const task = await repository.create(title.trim());
      return res.status(201).json(task);
    },

    updateCompleted: async (req, res) => {
      if (!validTaskId(req.params.id) || typeof req.body?.completed !== 'boolean') {
        return res.status(400).json({ error: 'A valid task ID and completed value are required.' });
      }
      const task = await repository.updateCompleted(req.params.id, req.body.completed);
      return task ? res.json(task) : res.status(404).json({ error: 'Task not found.' });
    },

    remove: async (req, res) => {
      if (!validTaskId(req.params.id)) {
        return res.status(400).json({ error: 'A valid task ID is required.' });
      }
      const removed = await repository.remove(req.params.id);
      return removed ? res.status(204).end() : res.status(404).json({ error: 'Task not found.' });
    }
  };
}
