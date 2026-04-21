from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str
    supabase_url: str
    supabase_key: str
    model_name: str = "llama-3.3-70b-versatile"
    max_tokens: int = 500
    max_history_messages: int = 20
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/callback"

    class Config:
        env_file = ".env"
        protected_namespaces = ("settings_",)


@lru_cache()
def get_settings():
    return Settings()