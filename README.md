# MudarisAI - Pembuat RPP Digital

Aplikasi pembuatan Rencana Pelaksanaan Pembelajaran (RPP), LKPD, PROTA/PROSEM, dan Instrumen Asesmen yang mengintegrasikan pendekatan Deep Learning, Kurikulum Berbasis Cinta (Panca Cinta), dan Kompetensi Global untuk Guru Indonesia.

## Prerequisites

- Node.js

## Setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `OPENROUTER_API_KEY` (dapatkan dari https://openrouter.ai/keys)
3. Jalankan aplikasi:
   `npm run dev`

## Konfigurasi

- `OPENROUTER_API_KEY` — API key dari OpenRouter (wajib)
- `AI_MODEL` — Model slug OpenRouter (opsional, default: `openai/gpt-4o-mini`)
- `APP_URL` — URL tempat aplikasi dihosting
