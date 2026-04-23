from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from services.supabase_service import supabase
from services.booking_service import BUSINESS_ID
from config import get_settings
import jwt
from datetime import datetime, timedelta

router = APIRouter()
settings = get_settings()
security = HTTPBearer()


class LoginRequest(BaseModel):
    username: str
    password: str


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(payload, settings.admin_secret_key, algorithm="HS256")


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, settings.admin_secret_key, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/admin/login")
async def login(request: LoginRequest):
    if request.username != settings.admin_username or request.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(request.username)
    return {"token": token}


@router.get("/admin/bookings")
async def get_bookings(status: str = None, date: str = None, _user: str = Depends(verify_token)):
    query = (
        supabase.table("bookings")
        .select("*, services(name, price, duration_minutes)")
        .eq("business_id", BUSINESS_ID)
        .order("booking_date", desc=True)
    )
    if status:
        query = query.eq("status", status)
    if date:
        query = query.eq("booking_date", date)
    result = query.execute()
    return result.data


@router.patch("/admin/bookings/{booking_id}")
async def update_booking_status(booking_id: str, status: str, _user: str = Depends(verify_token)):
    if status not in ["confirmed", "cancelled", "completed", "no_show"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = (
        supabase.table("bookings")
        .update({"status": status})
        .eq("id", booking_id)
        .execute()
    )
    return result.data


class ServiceCreate(BaseModel):
    name: str
    duration_minutes: int
    price: float
    description: str = ""


class ServiceUpdate(BaseModel):
    name: str | None = None
    duration_minutes: int | None = None
    price: float | None = None
    description: str | None = None
    is_active: bool | None = None


@router.get("/admin/services")
async def get_services(_user: str = Depends(verify_token)):
    result = (
        supabase.table("services")
        .select("*")
        .eq("business_id", BUSINESS_ID)
        .order("created_at")
        .execute()
    )
    return result.data


@router.post("/admin/services")
async def create_service(service: ServiceCreate, _user: str = Depends(verify_token)):
    result = (
        supabase.table("services")
        .insert({
            "business_id": BUSINESS_ID,
            "name": service.name,
            "duration_minutes": service.duration_minutes,
            "price": service.price,
            "description": service.description,
        })
        .execute()
    )
    return result.data[0]


@router.put("/admin/services/{service_id}")
async def update_service(service_id: str, service: ServiceUpdate, _user: str = Depends(verify_token)):
    update_data = {k: v for k, v in service.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        supabase.table("services")
        .update(update_data)
        .eq("id", service_id)
        .execute()
    )
    return result.data


@router.delete("/admin/services/{service_id}")
async def delete_service(service_id: str, _user: str = Depends(verify_token)):
    supabase.table("services").delete().eq("id", service_id).execute()
    return {"status": "deleted"}


class BusinessUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    opening_time: str | None = None
    closing_time: str | None = None
    days_open: list[int] | None = None


@router.get("/admin/business")
async def get_business(_user: str = Depends(verify_token)):
    result = (
        supabase.table("business")
        .select("*")
        .eq("id", BUSINESS_ID)
        .execute()
    )
    return result.data[0] if result.data else {}


@router.put("/admin/business")
async def update_business(business: BusinessUpdate, _user: str = Depends(verify_token)):
    update_data = {k: v for k, v in business.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = (
        supabase.table("business")
        .update(update_data)
        .eq("id", BUSINESS_ID)
        .execute()
    )
    return result.data


@router.get("/admin/stats")
async def get_stats(_user: str = Depends(verify_token)):
    from datetime import date
    today = date.today().isoformat()

    today_bookings = (
        supabase.table("bookings")
        .select("id")
        .eq("business_id", BUSINESS_ID)
        .eq("booking_date", today)
        .eq("status", "confirmed")
        .execute()
    )
    total_bookings = (
        supabase.table("bookings")
        .select("id")
        .eq("business_id", BUSINESS_ID)
        .execute()
    )
    confirmed = (
        supabase.table("bookings")
        .select("id")
        .eq("business_id", BUSINESS_ID)
        .eq("status", "confirmed")
        .execute()
    )
    cancelled = (
        supabase.table("bookings")
        .select("id")
        .eq("business_id", BUSINESS_ID)
        .eq("status", "cancelled")
        .execute()
    )

    return {
        "today_bookings": len(today_bookings.data),
        "total_bookings": len(total_bookings.data),
        "confirmed": len(confirmed.data),
        "cancelled": len(cancelled.data),
    }