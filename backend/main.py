from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.auth import router as auth_router
from routes.admin import router as admin_router

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
        "https://smilecare-two.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/test-services")
async def test_services():
    from services.supabase_service import supabase
    from services.booking_service import BUSINESS_ID
    all_services = supabase.table("services").select("*").execute()
    filtered = supabase.table("services").select("*").eq("business_id", BUSINESS_ID).execute()
    return {
        "business_id_used": BUSINESS_ID,
        "all_services_count": len(all_services.data),
        "filtered_count": len(filtered.data),
        "all_services": all_services.data,
    }

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}