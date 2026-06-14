"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import asr, chat, conversation, message, tools

app = FastAPI(
    title="Agent Demo API",
    description="AI Agent chat application backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(conversation.router)
app.include_router(message.router)
app.include_router(tools.router)
app.include_router(chat.router)
app.include_router(asr.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
