import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

const tasks = new Map();
let server;
let base;

const store = {
  list: async () => [...tasks.values()],
  create: async (title) => {
    const task = { _id: '507f1f77bcf86cd799439011', title, completed: false };
    tasks.set(task._id, task);
    return task;
  },
  updateCompleted: async (id, completed) => {
    const task = tasks.get(id);
    if (!task) return null;
    const updated = { ...task, completed };
    tasks.set(id, updated);
    return updated;
  },
  remove: async (id) => tasks.delete(id)
};

before(async () => {
  server = createApp(store).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('health endpoint responds', async () => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('task CRUD validates input and updates state', async () => {
  const invalid = await fetch(`${base}/api/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '   ' })
  });
  assert.equal(invalid.status, 400);

  const malformed = await fetch(`${base}/api/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{'
  });
  assert.equal(malformed.status, 400);

  const created = await fetch(`${base}/api/tasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '  Submit project  ' })
  });
  assert.equal(created.status, 201);
  const task = await created.json();
  assert.equal(task.title, 'Submit project');

  const listed = await fetch(`${base}/api/tasks`);
  assert.equal((await listed.json()).length, 1);

  const updated = await fetch(`${base}/api/tasks/${task._id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  assert.equal((await updated.json()).completed, true);

  const removed = await fetch(`${base}/api/tasks/${task._id}`, { method: 'DELETE' });
  assert.equal(removed.status, 204);
  assert.deepEqual(await (await fetch(`${base}/api/tasks`)).json(), []);
  assert.equal((await fetch(`${base}/api/tasks/${task._id}`, { method: 'DELETE' })).status, 404);
});
