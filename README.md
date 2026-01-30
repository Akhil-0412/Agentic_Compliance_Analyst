---
title: Agentic Compliance Analyst API
emoji: ⚖️
colorFrom: orange
colorTo: red
sdk: docker
pinned: false
license: mit
---

# Agentic Compliance Analyst - Backend API

A FastAPI backend for GDPR/CCPA compliance analysis powered by LLMs.

## Deployment Status

- **Frontend**: [Vercel](https://vercel.com/akhil-0412s-projects/agentic-compliance-analyst-frontend)
- **Backend**: [Hugging Face Space](https://huggingface.co/spaces/Akhil-008/agentic-compliance-analyst)

## Endpoints

- `GET /` - Health check
- `POST /api/chat` - Compliance query

## Environment Variables (Secrets)

Set these in your Space settings:
- `GROQ_API_KEY`
- `TAVILY_API_KEY`