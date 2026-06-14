# agent-demo

一个从前端到后端的 AI Agent 聊天应用完整实现。支持插件式工具注册、流式对话、语音输入、多模态理解。

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Modern.js + React + Zustand + TailwindCSS + Arco Design |
| 后端 | Python + FastAPI + LangChain + SQLModel |
| 模型 | 阿里云 DashScope（文本、多模态、ASR） |
| 数据库 | SQLite |

## 快速开始

```bash
# 终端 1: 后端
cd backend
cp .env.example .env   # 填入 ALIYUN_DASHSCOPE_API_KEY
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000

# 终端 2: 前端
cd frontend
pnpm install
pnpm dev                # http://localhost:3000
```

## 项目结构

```
agent-demo/
├── frontend/           # Modern.js 前端
├── backend/            # FastAPI 后端
├── docs/               # 课程文档
└── README.md
```

## 课程文档

详见 [docs/](docs/) 目录，共 12 章，从零到一搭建。
