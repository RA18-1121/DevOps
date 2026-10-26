import { Task } from '../models/Task.js';

export const mongoTaskRepository = {
  list: () => Task.find().sort({ createdAt: -1 }).lean(),
  create: (title) => Task.create({ title }),
  updateCompleted: (id, completed) => Task.findByIdAndUpdate(
    id, { completed }, { new: true, runValidators: true }
  ).lean(),
  remove: async (id) => Boolean(await Task.findByIdAndDelete(id))
};
