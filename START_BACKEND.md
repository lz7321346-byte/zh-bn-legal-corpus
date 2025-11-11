# 后端服务启动指南

## 方式一：本地 Python 启动（推荐）

### 1. 检查 Python 版本
确保已安装 Python 3.11 或更高版本：
```bash
python --version
```

### 2. 创建虚拟环境（如果还没有）
在项目根目录执行：
```bash
# Windows
python -m venv .venv

# 激活虚拟环境
# Windows PowerShell
.venv\Scripts\Activate.ps1

# Windows CMD
.venv\Scripts\activate.bat
```

### 3. 安装依赖
在虚拟环境激活后，在项目根目录执行：
```bash
pip install -e .[dev]
```

### 4. 启动后端服务
在项目根目录执行：
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

`--reload` 参数会在代码更改时自动重启服务，方便开发。

### 5. 验证服务运行
- 访问 http://127.0.0.1:8000 查看服务信息
- 访问 http://127.0.0.1:8000/docs 查看 API 文档
- 访问 http://127.0.0.1:8000/api/v1/terms?q=宪法 测试搜索功能

## 方式二：Docker 启动

### 1. 确保已安装 Docker 和 Docker Compose

### 2. 启动服务
在项目根目录执行：
```bash
docker compose up --build backend
```

### 3. 停止服务
```bash
docker compose down
```

## 常见问题

### 问题1：端口 8000 已被占用
解决方案：
- 更改端口：`uvicorn backend.app.main:app --host 127.0.0.1 --port 8001 --reload`
- 或关闭占用 8000 端口的其他程序

### 问题2：模块导入错误
解决方案：
- 确保在项目根目录执行命令
- 确保虚拟环境已激活
- 确保已安装所有依赖：`pip install -e .[dev]`

### 问题3：CORS 错误
解决方案：
- 检查 `backend/app/config.py` 中的 `cors_origins` 配置
- 确保包含前端地址：`http://localhost:3000`

## 快速启动命令（Windows PowerShell）

```powershell
# 1. 进入项目目录
cd "C:\Users\周科伽、\Desktop\zh-bn-legal-corpus-main"

# 2. 创建并激活虚拟环境（如果还没有）
python -m venv .venv
.venv\Scripts\Activate.ps1

# 3. 安装依赖（首次运行）
pip install -e .[dev]

# 4. 启动服务
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

## 环境变量配置（可选）

如果需要配置管理员令牌，创建 `.env` 文件：
```
APP_ADMIN_TOKEN=your-secret-token-here
```

