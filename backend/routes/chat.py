from fastapi import APIRouter, HTTPException
from models.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationListResponse,
    ConversationOut,
    MessageOut,
)
from services import supabase_service as db
from services import groq as ai
from config import get_settings

router = APIRouter()
settings = get_settings()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        is_new = request.conversation_id is None
        conv_id = request.conversation_id or db.create_conversation()

        history = []
        if not is_new:
            history = db.get_conversation_history(
                conv_id, limit=settings.max_history_messages
            )

        reply, tokens = ai.get_chat_response(request.message, history)

        db.save_messages(conv_id, request.message, reply, tokens)

        if is_new:
            try:
                title = ai.generate_title(request.message)
                db.update_conversation_title(conv_id, title)
            except Exception:
                pass

        return ChatResponse(
            reply=reply,
            conversation_id=conv_id,
            tokens_used=tokens,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations():
    conversations = db.get_conversations()
    return ConversationListResponse(
        conversations=[
            ConversationOut(
                id=c["id"],
                title=c["title"],
                updated_at=c["updated_at"],
            )
            for c in conversations
        ]
    )


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str):
    messages = db.get_conversation_messages(conversation_id)
    return [
        MessageOut(
            id=m["id"],
            role=m["role"],
            content=m["content"],
            created_at=m["created_at"],
        )
        for m in messages
    ]


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    db.delete_conversation(conversation_id)
    return {"status": "deleted"}