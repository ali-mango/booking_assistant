from supabase import create_client, Client
from config import get_settings

settings = get_settings()
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


def create_conversation(user_id: str = "default_user") -> str:
    result = supabase.table("conversations").insert(
        {"user_id": user_id}
    ).execute()
    return result.data[0]["id"]


def get_conversation_history(conversation_id: str, limit: int = 20) -> list[dict]:
    result = (
        supabase.table("messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .limit(limit)
        .execute()
    )
    return result.data


def save_messages(conversation_id: str, user_msg: str, assistant_msg: str, tokens: int = 0):
    supabase.table("messages").insert([
        {
            "conversation_id": conversation_id,
            "role": "user",
            "content": user_msg,
            "tokens_used": 0,
        },
        {
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": assistant_msg,
            "tokens_used": tokens,
        },
    ]).execute()


def update_conversation_title(conversation_id: str, title: str):
    supabase.table("conversations").update(
        {"title": title}
    ).eq("id", conversation_id).execute()


def get_conversations(user_id: str = "default_user", limit: int = 50) -> list[dict]:
    result = (
        supabase.table("conversations")
        .select("id, title, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def get_conversation_messages(conversation_id: str) -> list[dict]:
    result = (
        supabase.table("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return result.data


def delete_conversation(conversation_id: str):
    supabase.table("conversations").delete().eq("id", conversation_id).execute()


def get_user_preferences(user_id: str = "default_user") -> dict | None:
    result = (
        supabase.table("user_preferences")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None