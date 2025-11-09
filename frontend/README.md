# Zh–Bn Legal Corpus Frontend

This directory contains a lightweight Next.js application that provides a Chinese–Bengali legal terminology experience inspired by [Chinese Law Translation](https://www.chineselawtranslation.com/zh/).

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The development server runs on <http://localhost:3000>. It expects the FastAPI backend to be available locally at <http://127.0.0.1:8000>.

## Customisation guide

- Update `app/page.tsx` to tweak the layout, upload behaviour, or messaging shown to translators.
- Adjust `app/globals.css` to refine the typography and colours.
- The backend endpoints that power search and uploads live in `backend/app/api/terms.py`.
