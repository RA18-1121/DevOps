import { useCallback, useEffect, useState } from 'react';

async function request(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setTasks(await request('/api/tasks'));
      setError('');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await request('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      setTitle('');
      await refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeTask(task, method) {
    if (busy) return;
    setBusy(true);
    try {
      await request(`/api/tasks/${task._id}`, method === 'DELETE' ? { method } : {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      await refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  const done = tasks.filter((task) => task.completed).length;

  return (
    <main className="shell">
      <div className="eyebrow">MERN • DOCKER • GITHUB ACTIONS</div>
      <header>
        <div>
          <h1>TaskFlow<span>.</span></h1>
          <p>A small task manager built to demonstrate a complete DevOps pipeline.</p>
        </div>
        <div className="status"><span className="status-dot" /> Live application</div>
      </header>

      <section className="panel" aria-label="Tasks">
        <div className="panel-heading">
          <div>
            <h2>My tasks</h2>
            <p>{tasks.length ? `${done} of ${tasks.length} completed` : 'Make a start with your first task.'}</p>
          </div>
          <span className="count">{tasks.length}</span>
        </div>

        <form onSubmit={addTask} className="add-form">
          <label className="sr-only" htmlFor="task-title">New task</label>
          <input id="task-title" maxLength="120" value={title}
            onChange={(event) => setTitle(event.target.value)} placeholder="What needs to get done?" />
          <button type="submit" disabled={busy || !title.trim()}>Add task</button>
        </form>

        {error && <div className="error" role="alert">{error} <button onClick={refresh}>Retry</button></div>}

        {loading ? <p className="empty">Loading tasks…</p> : tasks.length === 0 ? (
          <div className="empty">No tasks yet. Add one above to get started.</div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id} className={task.completed ? 'completed' : ''}>
                <button className="check" disabled={busy} onClick={() => changeTask(task, 'PATCH')}
                  aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}>
                  {task.completed ? '✓' : ''}
                </button>
                <span className="task-title">{task.title}</span>
                <button className="delete" disabled={busy} onClick={() => changeTask(task, 'DELETE')}
                  aria-label={`Delete ${task.title}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer>React frontend · Express API · MongoDB database</footer>
    </main>
  );
}
