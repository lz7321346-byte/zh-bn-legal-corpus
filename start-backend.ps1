# 后端服务启动脚本 (Windows PowerShell)
# 使用方法：在 PowerShell 中执行 .\start-backend.ps1

Write-Host "正在启动后端服务..." -ForegroundColor Green

# 检查是否在项目根目录
if (-not (Test-Path "pyproject.toml")) {
    Write-Host "错误：请在项目根目录执行此脚本" -ForegroundColor Red
    Write-Host "项目根目录应包含 pyproject.toml 文件" -ForegroundColor Yellow
    exit 1
}

# 检查 Python 是否安装
try {
    $pythonVersion = python --version 2>&1
    Write-Host "检测到: $pythonVersion" -ForegroundColor Cyan
} catch {
    Write-Host "错误：未找到 Python，请先安装 Python 3.11 或更高版本" -ForegroundColor Red
    exit 1
}

# 检查虚拟环境是否存在
if (-not (Test-Path ".venv")) {
    Write-Host "正在创建虚拟环境..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：创建虚拟环境失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "虚拟环境创建成功" -ForegroundColor Green
} else {
    Write-Host "虚拟环境已存在" -ForegroundColor Cyan
}

# 激活虚拟环境
Write-Host "正在激活虚拟环境..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# 检查是否需要安装依赖
Write-Host "正在检查依赖..." -ForegroundColor Yellow
$checkResult = python -c "import fastapi" 2>&1
if ($LASTEXITCODE -ne 0 -or $checkResult -match "Error|ModuleNotFoundError") {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    pip install -e .[dev]
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：安装依赖失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "依赖已安装" -ForegroundColor Cyan
}

# 启动服务
Write-Host "正在启动后端服务..." -ForegroundColor Green
Write-Host "服务地址: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "API 文档: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host ""

uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

