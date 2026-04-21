from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.auth import router as auth_router

app = FastAPI(
    title="AI Assistant",
    description="Multilingual AI assistant with task management",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}