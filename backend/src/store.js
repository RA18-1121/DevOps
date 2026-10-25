import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export const mongoStore = {
  list: () => Task.find().sort({ createdAt: -1 }).lean(),
  create: (title) => Task.create({ title }),
  updateCompleted: (id, completed) => Task.findByIdAndUpdate(
    id, { completed }, { new: true, runValidators: true }
  ).lean(),
  remove: async (id) => Boolean(await Task.findByIdAndDelete(id))
};
