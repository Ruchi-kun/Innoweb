# Innoweb ADK Backend

Local Python API for the Innoweb agent pipeline.

## Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:GOOGLE_API_KEY="your-gemini-key"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\firebase-service-account.json"
uvicorn app.main:app --reload --port 8000
```

Firebase Admin credentials are required. The backend intentionally does not use a local data-store fallback.

## ADK

The ADK entrypoint is `app/agent.py` and exposes `root_agent`.
