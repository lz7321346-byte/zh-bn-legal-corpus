# Backend Service

This directory contains the FastAPI backend for the Bengali-Chinese legal terminology platform.

## Getting started

### Local Python workflow

1. Create and activate a virtual environment, then install the editable package:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -e .[dev]
   ```

2. Start the FastAPI application with Uvicorn:

   ```bash
   uvicorn backend.app.main:app --reload
   ```

3. Confirm the API is running:

   ```bash
   curl http://127.0.0.1:8000/api/v1/healthz
   ```

   You can browse the interactive API reference at `http://127.0.0.1:8000/docs`.

### Docker workflow

1. Build and run only the backend service (the database container starts automatically):

   ```bash
   docker compose up --build backend
   ```

2. Visit `http://localhost:8000` in a browser (or `curl` the URL above) to view the service metadata JSON returned by the root endpoint.

3. Stop the containers when finished:

   ```bash
   docker compose down
   ```
