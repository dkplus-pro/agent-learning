# 第一章：项目初始化

## 目标

从零搭建 monorepo 项目结构，配置前后端开发环境。

## 前置知识

作为前端开发者，你已经熟悉：
- Node.js / npm / pnpm
- TypeScript / React
- 基本的终端操作

本项目新增的部分：
- Python 环境（需要 3.11+）
- FastAPI（Python 的 async web 框架，类似 Koa/Express）
- Monorepo 概念（前后端在一个 git 仓库）

## 为什么要用 Monorepo？

```
agent-demo/
├── frontend/           # 前端代码
├── backend/            # 后端代码
├── docs/               # 文档
└── README.md
```

Monorepo 的好处：
1. **共享类型定义**：后端的 OpenAPI spec 可以生成前端 TS 类型
2. **统一版本**：前后端始终匹配，不存在"前端 v2 后端 v1"的问题
3. **一次 clone**：学员只需要 `git clone` 一次

## Python 环境准备

```bash
python3 --version   # 需要 >= 3.11
pip install virtualenv
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

关键区别（前端 vs Python）：

| 概念 | Node.js | Python |
|------|---------|--------|
| 包管理器 | pnpm/npm | pip |
| 依赖文件 | package.json | requirements.txt |
| 虚拟环境 | node_modules（自动） | .venv（需要手动创建） |
| 运行脚本 | npx / node | python |

## FastAPI 简介

FastAPI 是 Python 生态最现代的 web 框架。如果你是前端，可以这样类比：

| FastAPI | Express/Koa |
|---------|-------------|
| `@app.get("/path")` | `app.get("/path", handler)` |
| Pydantic schema | zod / joi |
| async def | async function |
| Request dependency injection | middleware |

第一个接口：

```python
# backend/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

`async def` 就是 Python 版的 `async function`，FastAPI 会自动处理异步。

## 前端：Modern.js 搭建

Modern.js 是字节跳动的全栈 React 框架，类似 Next.js。本项目只用它做 SPA：

- **文件系统路由**：`src/routes/` 下的目录结构自动映射为路由
- **配置代理**：`modern.config.ts` 配置 `/api` 代理到后端

```ts
// modern.config.ts
tools: {
  devServer: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
}
```

## 运行验证

```bash
# 终端 1
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# 访问 http://localhost:8000/health → {"status":"ok"}

# 终端 2
cd frontend
pnpm install
pnpm dev
# 访问 http://localhost:3000 → "Agent Demo"
```

## 项目结构一览

```
agent-demo/
├── frontend/
│   ├── modern.config.ts    # Modern.js 配置
│   ├── tailwind.config.js  # TailwindCSS 配置
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── globals.css     # 全局样式
│       ├── routes/
│       │   ├── layout.tsx  # 根布局
│       │   └── page.tsx    # 首页
│       └── types/
│           └── api.d.ts    # OpenAPI 生成的类型（暂空）
├── backend/
│   ├── main.py             # FastAPI 入口
│   ├── config.py           # 配置
│   ├── requirements.txt    # 依赖
│   └── .env.example        # 环境变量模板
├── docs/
│   └── 01-project-init.md  # 本章
└── README.md
```
