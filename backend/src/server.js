import mongoose from 'mongoose';
import { createApp } from './app.js';
import { mongoTaskRepository } from './repositories/mongoTaskRepository.js';

const port = Number(process.env.PORT || 3000);
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/tasks';

try {
  await mongoose.connect(mongoUrl);
  const server = createApp(mongoTaskRepository).listen(port, '0.0.0.0', () => {
    console.log(`API listening on port ${port}`);
  });
  async function shutdown() {
    server.close();
    await mongoose.disconnect();
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch (error) {
  console.error('Could not connect to MongoDB:', error);
  process.exit(1);
}
