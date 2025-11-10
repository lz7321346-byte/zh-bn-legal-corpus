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

## 快速开始

1. **启动后端服务**
   - 使用本地 Python 环境：`python -m venv .venv && source .venv/bin/activate && pip install -e .[dev] && uvicorn backend.app.main:app --reload`
   - 或者使用 Docker Compose：`docker compose up --build backend`
   - **重要**：设置管理员令牌环境变量：`export APP_ADMIN_TOKEN=你的安全令牌`（或在 `.env` 文件中设置）
2. **启动前端界面**
   - 在另一个终端中运行：`cd frontend && npm install && npm run dev`
3. **开始使用**
   - 打开浏览器访问前端应用（通常为 `http://localhost:3000`）
   - 搜索已有术语：在搜索框中输入中文、孟加拉语或英文关键词
   - **管理员功能**：在前端输入管理员令牌并保存，即可使用添加术语和批量导入功能

## 管理员权限与批量导入

### 管理员令牌配置

- 后端通过环境变量 `APP_ADMIN_TOKEN` 配置管理员令牌
- 所有"新增术语"和"批量导入"接口均需在请求头携带 `X-Admin-Token`
- 前端提供"管理员令牌"输入框，保存后仅在本机浏览器生效（存储在 localStorage）

### 批量导入（Excel/Word）

- 支持 `.xlsx`（Excel）与 `.docx`（Word）文件格式
- **Excel 文件格式**：
  - 需包含表头列：`zh`、`bn`、`en`（不区分大小写，顺序不限）
  - 每行一个术语，对应三个语言字段
- **Word 文件格式**：
  - 每段一行，格式为：`中文｜孟加拉语｜英文`（使用 `｜` 分隔符）
- 接口：`POST /api/v1/terms/upload`，表单字段名 `file`

**示例（cURL）：**

```bash
# 批量导入
curl -X POST \
  -H "X-Admin-Token: $APP_ADMIN_TOKEN" \
  -F "file=@terms.xlsx" \
  http://localhost:8000/api/v1/terms/upload

# 单条新增
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: $APP_ADMIN_TOKEN" \
  -d '{"zh":"合同","bn":"চুক্তি","en":"contract"}' \
  http://localhost:8000/api/v1/terms
```

### 单条新增术语

- 接口：`POST /api/v1/terms`
- 需要管理员令牌（`X-Admin-Token` 头）
- 请求体：`{"zh": "中文", "bn": "孟加拉语", "en": "英文"}`

## 多语种支持

- 目前模型包含中文（`zh`）、孟加拉语（`bn`）与英文（`en`）
- 界面已按"多语种"方向调整，后续可按需扩展更多语种字段与导入格式
- 搜索功能支持自动语言检测，可根据输入内容自动识别语言类型

## Next steps

- Bootstrap the Next.js frontend in the `frontend/` directory.
- Define database models for legal terms, definitions, and corpus alignments.
- Implement ingestion pipelines for official legal sources in Bengali and Chinese.
- Add automated tests and CI workflows.
