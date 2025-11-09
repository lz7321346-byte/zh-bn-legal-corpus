# Zh–Bn Legal Corpus Frontend

This directory contains a lightweight Next.js application that provides a Chinese–Bengali legal terminology experience inspired by [Chinese Law Translation](https://www.chineselawtranslation.com/zh/).

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The development server runs on <http://localhost:3000>. It expects the FastAPI backend to be available locally at <http://127.0.0.1:8000>.

## 数据导入说明

- 支持上传 `.xlsx` 和 `.docx` 文件。
- Excel 文件推荐包含 `zh`（中文）、`bn`（孟加拉语）、`en`（英文）三列，方便自动识别字段。
- Word 文件建议每行使用 `中文｜孟加拉语｜英文` 的竖线分隔格式，便于解析。
- 上传成功后，术语数据会持久化写入 `backend/data/terms.json`，实现离线可用。

## Customisation guide

- Update `app/page.tsx` to tweak the layout, upload behaviour, or messaging shown to translators.
- Adjust `app/globals.css` to refine the typography and colours.
- The backend endpoints that power search and uploads live in `backend/app/api/terms.py`.
