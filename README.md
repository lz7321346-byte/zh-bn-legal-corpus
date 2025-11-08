# zh-bn-legal-corpus

An open-source initiative to build a Bengali-Chinese legal terminology dictionary and parallel corpus inspired by [Chinese Law Translation](https://www.chineselawtranslation.com/zh).

## Project structure

```
backend/    FastAPI service exposing APIs for the dictionary and corpus.
frontend/   Next.js application (to be bootstrapped) for dictionary and corpus UI.
scripts/    Utility scripts for data ingestion and maintenance (placeholders).
```

## Getting started (backend)

You can run the FastAPI service either directly with Python or inside Docker.

### Option A — run with a local Python environment

1. **Create and activate a virtual environment** (requires Python 3.11+):

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. **Install the backend dependencies** listed in `pyproject.toml`:

   ```bash
   pip install -e .[dev]
   ```

3. **Launch the API server** with auto-reload enabled:

   ```bash
   uvicorn backend.app.main:app --reload
   ```

   Uvicorn will listen on `http://127.0.0.1:8000` by default.

4. **Verify the service** in your terminal or browser:

   ```bash
   curl http://127.0.0.1:8000/api/v1/healthz
   # -> {"status": "ok"}
   ```

   The automatically generated API documentation is served at `http://127.0.0.1:8000/docs`.

### Option B — run with Docker Compose

1. **Build and start the stack** (PostgreSQL + backend service):

   ```bash
   docker compose up --build backend
   ```

   The first run downloads the base images and installs Python packages inside the container image.

2. **Check the container logs** to make sure Uvicorn started successfully. You should see a line similar to:

   ```
   Application startup complete.
   Uvicorn running on http://0.0.0.0:8000
   ```

3. **Test the running service** from another terminal window:

   ```bash
   curl http://localhost:8000/api/v1/healthz
   ```

4. **Stop the stack** when you are finished:

   ```bash
   docker compose down
   ```

Both approaches expose the same API surface, so you can explore the “finished” backend prototype through the Swagger UI at `http://localhost:8000/docs`.

## Next steps

- Bootstrap the Next.js frontend in the `frontend/` directory.
- Define database models for legal terms, definitions, and corpus alignments.
- Implement ingestion pipelines for official legal sources in Bengali and Chinese.
- Add automated tests and CI workflows.

