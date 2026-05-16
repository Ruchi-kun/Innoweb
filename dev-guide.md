1. Setup environment variables

```
GOOGLE_API_KEY=""

GOOGLE_APPLICATION_CREDENTIALS=""

FIREBASE_SERVICE_ACCOUNT_JSON=""
```

2. go to backend folder

3. install python dependencies

```
pip install -r requirements.txt
```

4. start the fastapi server using uvicorn

```
uvicorn app.main:app --reload --port 8000
```

5. In a different terminal, start the frontend

```
npm i
npm run dev
```
