# Containerized MERN Task Manager

A small task manager for a college DevOps submission. React provides the interface, Express exposes a REST API, and MongoDB stores tasks. Docker Compose runs all three services. GitHub Actions tests the API, builds the frontend and both Docker images, and publishes images to GitHub Container Registry (GHCR) after a successful push to `main`.

## Architecture

```text
Browser :8080 → Nginx/React → /api proxy → Express :3000 → MongoDB :27017
                  web container        api container   mongo container
```

The web container is available on port 8080. MongoDB is available only on your computer at `127.0.0.1:27017` so you can inspect it with MongoDB Compass. Its data is stored in the `mongo_data` Docker volume, so tasks remain after containers restart.

## Prerequisites

- Docker Desktop with Docker Compose
- Node.js 24 and npm to run tests outside Docker
- A GitHub repository for the automated workflow

## Run locally

From the project root:

```powershell
docker compose up --build -d
docker compose ps
```

Open **http://localhost:8080**. Check the API through Nginx at **http://localhost:8080/health**.

To inspect the data in MongoDB Compass, connect to `mongodb://localhost:27017`. Open the `tasks` database and its `tasks` collection. If you already have MongoDB running on port 27017, stop it first or change the host-side port in the Compose file and use that port in Compass.

To stop the containers without removing your tasks:

```powershell
docker compose down
```

Run `docker compose up -d` again and check that your tasks are still present. **Do not use `docker compose down -v` if you want to keep your tasks:** `-v` deletes the database volume.

## Run checks without Docker

```powershell
cd backend
npm ci
npm test
cd ..\frontend
npm ci
npm run build
```

The API tests check the health endpoint, input validation, and task creation, listing, completion, and deletion. They inject an in-memory repository, so MongoDB is not needed for these tests.

## GitHub Actions and published images

The workflow is in `.github/workflows/ci-cd.yml`. Pull requests to `main` and pushes to `main` run tests and build checks. A successful push to `main` also publishes two images:

- `ghcr.io/<your-lowercase-username>/mern-task-api:latest`
- `ghcr.io/<your-lowercase-username>/mern-task-web:latest`

The workflow uses GitHub's built-in `GITHUB_TOKEN` with `packages: write`; no registry password needs to be committed. Each image also receives a commit SHA tag. If your repository uses a different default branch, change `main` in the workflow.

To run the images built by GitHub Actions instead of building locally, first make the GHCR packages public in GitHub's package settings **or** authenticate Docker to GHCR for private packages. Then in PowerShell:

```powershell
$env:GHCR_OWNER = "your-lowercase-github-username"
docker compose -f compose.production.yaml pull
docker compose -f compose.production.yaml up -d
```

If the local Compose stack is already running, stop it first with `docker compose down` to release port 8080. Both Compose files use the same `mongo_data` volume when run from this project directory.

Publishing an image does not automatically restart the containers on your laptop. Run the `pull` and `up -d` commands above to use the latest published images.

## Suggested live demonstration

1. Run `docker compose up --build -d` and open the task manager.
2. Add and complete a task. Run `docker compose down` and `docker compose up -d` to demonstrate database persistence.
3. Push a small change to `main`, then show the green GitHub Actions run and the published image tags.
4. Stop the local stack, set `GHCR_OWNER`, and run the published images with `compose.production.yaml`.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Health status |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Add task with `{ "title": "..." }` |
| PATCH | `/api/tasks/:id` | Set `{ "completed": true/false }` |
| DELETE | `/api/tasks/:id` | Delete task |

## Project layout

```text
backend/
  src/server.js              MongoDB connection and server startup
  src/app.js                 Express setup and route mounting
  src/models/Task.js         Mongoose task schema
  src/controllers/           Request validation and responses
  src/routes/                API URL definitions
  src/repositories/          MongoDB queries
  test/                      API tests
frontend/                    React app, Nginx proxy, Dockerfile
compose.yaml                 Build and run from local source
compose.production.yaml      Pull and run images published by GitHub Actions
.github/workflows/ci-cd.yml  CI and image publishing
```
