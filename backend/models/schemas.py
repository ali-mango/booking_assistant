from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    tokens_used: int


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class ConversationOut(BaseModel):
    id: str
    title: str
    updated_at: str


class ConversationListResponse(BaseModel):
    conversations: list[ConversationOut]