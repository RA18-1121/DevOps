import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 120 },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);
