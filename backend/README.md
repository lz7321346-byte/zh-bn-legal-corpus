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

术语数据默认存储在 `backend/data/terms.json` 中，前端上传的新术语会自动合并到该文件，便于后续离线使用。**注意：** 默认的 Docker Compose 配置会以只读方式挂载 `./backend` 目录（`./backend:/app/backend:ro`），容器中的上传接口因此无法写入 `backend/data/terms.json`，上传请求会失败。若要在 Docker 工作流中持久化术语，请在 `docker-compose.yml` 中移除挂载路径的 `:ro` 标记，或改为挂载 `./backend/data:/app/backend/data` 等可写目录；否则请使用本地 Python 工作流来导入术语数据。
