FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --upgrade pip \
    && pip install --no-cache-dir fastapi==0.111.0 uvicorn[standard]==0.29.0 sqlalchemy==2.0.30 asyncpg==0.29.0 \
    alembic==1.13.1 pydantic-settings==2.2.1 python-dotenv==1.0.1

COPY backend ./backend

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
