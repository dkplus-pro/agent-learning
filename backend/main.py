"""FastAPI 应用入口，创建 FastAPI 实例、注册中间件和路由。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import asr, chat, conversation, message, tools

app = FastAPI(
    title="Agent Demo API",
    description="AI Agent 聊天应用后端",
    version="0.1.0",
)

# 配置 CORS 中间件，允许前端跨域访问
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

# 注册各个功能模块的路由
app.include_router(conversation.router)
app.include_router(message.router)
app.include_router(tools.router)
app.include_router(chat.router)
app.include_router(asr.router)


@app.get("/health")
async def health_check():
    """健康检查接口，用于确认服务正常运行。"""
    return {"status": "ok"}
