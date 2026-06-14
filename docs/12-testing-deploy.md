# 第十二章：测试与部署

## 目标

为前后端添加单元测试，验证核心功能，提供部署指南。

## 后端测试总览

### 测试结构

```
backend/tests/
├── conftest.py              # pytest fixtures
├── test_models.py           # SQLModel 模型测试 (5 tests)
├── test_conversation.py     # 对话 CRUD 测试 (7 tests)
├── test_message.py          # 消息 API 测试 (7 tests)
├── test_tools.py            # 工具插件测试 (7 tests)
├── test_chat.py             # SSE 流式聊天测试 (5 tests)
└── test_asr.py              # ASR 测试 (4 tests)
```

**总计：35 个测试用例**

### 运行后端测试

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

### 测试覆盖

| 模块 | 测试数 | 覆盖场景 |
|------|--------|---------|
| Models | 5 | 创建、默认值、查询、外键关系 |
| Conversation CRUD | 7 | 增删改查、404 处理 |
| Message API | 7 | 创建、列表、删除、验证错误 |
| Tools | 7 | 自动发现、参数定义、API 端点 |
| Chat SSE | 5 | 流式响应、工具调用、自动标题、消息持久化 |
| ASR | 4 | 转录、多格式支持、错误处理 |

### Mock 策略

- **DashScope API**：使用 `unittest.mock` 模拟，避免真实 API 调用
- **数据库**：内存 SQLite，每个测试独立，无数据污染
- **文件系统**：ASR 临时文件自动清理

```python
# Mock 示例
with patch("services.llm_service.Generation") as mock_gen:
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.output.choices = [
        AsyncMock(message=AsyncMock(content="Hello!"))
    ]
    mock_gen.call.return_value = [mock_response]
    
    # 测试流式聊天
    response = await client.post("/api/chat/stream", json={...})
    assert response.status_code == 200
```

## 前端测试总览

### 测试结构

```
frontend/src/tests/
├── setup.ts                        # Jest DOM 扩展
└── stores/
    ├── conversationStore.test.ts   # 对话状态测试 (5 tests)
    ├── messageStore.test.ts        # 消息状态测试 (5 tests)
    └── uiStore.test.ts             # UI 状态测试 (2 tests)
```

**总计：12 个测试用例**

### 运行前端测试

```bash
cd frontend
pnpm test
```

### Zustand Store 测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useConversationStore } from '@/stores/conversationStore';

describe('conversationStore', () => {
  beforeEach(() => {
    useConversationStore.setState({
      conversations: [],
      activeConversationId: null,
    });
  });

  it('should add a conversation', () => {
    const conversation = {
      id: 'conv-1',
      title: '测试对话',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    act(() => {
      useConversationStore.getState().addConversation(conversation);
    });

    const { conversations } = useConversationStore.getState();
    expect(conversations).toHaveLength(1);
  });
});
```

### 为什么测试 Store 而不是组件？

- **Store 是纯逻辑**：状态变更、副作用，易于测试
- **组件测试成本高**：需要 Mock DOM、事件、异步数据
- **Store 测试覆盖面广**：一个 action 可能影响多个组件

如果需要组件测试，使用 `@testing-library/react` 的 `render` + `fireEvent`。

## 本地运行完整项目

### 终端 1：后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 初始化数据库
alembic upgrade head

# 配置 API Key
cp .env.example .env
# 编辑 .env，填入 ALIYUN_DASHSCOPE_API_KEY

# 启动服务
uvicorn main:app --reload --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档

### 终端 2：前端

```bash
cd frontend
pnpm install
pnpm dev
```

访问 http://localhost:3000

### 验证清单

- [ ] 创建新对话
- [ ] 发送消息，AI 流式回复
- [ ] 切换工具（AI 写作、翻译）
- [ ] 语音输入（需要麦克风权限）
- [ ] 上传附件（图片、音频）
- [ ] 编辑对话标题
- [ ] 删除对话（级联删除消息）
- [ ] 切换对话，消息历史正确加载

## 生产部署（可选）

### 后端部署

```bash
# 构建
cd backend
pip install -r requirements.txt
alembic upgrade head

# 运行（生产环境）
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**注意事项**：
- SQLite 不适合高并发生产环境，考虑 PostgreSQL
- 配置 HTTPS（Nginx 反向代理）
- 设置环境变量 `ALIYUN_DASHSCOPE_API_KEY`
- 添加日志收集和监控

### 前端部署

```bash
cd frontend
pnpm build
pnpm start  # 或部署到 CDN
```

**注意事项**：
- 构建产物在 `frontend/dist/`
- 配置 Nginx 代理 `/api/*` 到后端
- 启用 gzip 压缩
- 设置缓存策略

### Docker 部署（可选）

```dockerfile
# Dockerfile - 后端
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile - 前端
FROM node:20-slim
WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY frontend/ .
RUN pnpm build
CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - ALIYUN_DASHSCOPE_API_KEY=${ALIYUN_DASHSCOPE_API_KEY}
  
  frontend:
    build: .
    dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 项目总结

### 技术栈回顾

| 层 | 技术 | 版本 |
|---|------|------|
| 前端框架 | Modern.js | 2.x |
| UI 组件库 | Arco Design | 2.x |
| 状态管理 | Zustand | 4.x |
| 虚拟滚动 | react-virtuoso | 4.x |
| Markdown | react-markdown | 9.x |
| 后端框架 | FastAPI | 0.110+ |
| ORM | SQLModel | 0.0.16+ |
| 数据库 | SQLite | 内置 |
| LLM | DashScope (通义千问) | 1.17+ |
| 流式传输 | SSE | 原生 |

### 项目架构

```
agent-demo/
├── frontend/                    # Modern.js 前端
│   ├── src/
│   │   ├── api/                # API 客户端 (openapi-fetch)
│   │   ├── features/chat/      # 聊天功能
│   │   │   ├── components/     # UI 组件
│   │   │   └── hooks/          # 自定义 hooks
│   │   ├── stores/             # Zustand stores
│   │   ├── types/              # TypeScript 类型
│   │   └── routes/             # 路由
│   └── tests/                  # Vitest 测试
│
├── backend/                     # FastAPI 后端
│   ├── routers/                # API 路由
│   ├── models/                 # SQLModel 表
│   ├── schemas/                # Pydantic schema
│   ├── services/               # 业务逻辑 (LLM, ASR)
│   ├── tools/                  # 工具插件
│   ├── alembic/                # 数据库迁移
│   └── tests/                  # pytest 测试
│
├── docs/                        # 12 章教程文档
└── README.md
```

### 核心功能清单

- ✅ 对话管理（增删改查）
- ✅ 消息收发（用户输入、AI 回复）
- ✅ 流式响应（SSE，实时显示 AI 输出）
- ✅ 工具切换（AI 写作、翻译）
- ✅ 语音输入（录音 + ASR 转录）
- ✅ 附件上传（图片、音频预览）
- ✅ 虚拟滚动（万条消息无压力）
- ✅ Markdown 渲染（代码高亮、表格）
- ✅ 自动标题（首条消息生成对话标题）
- ✅ 消息状态（complete / interrupted）

### 扩展建议

1. **多模态支持**：调用 DashScope 多模态模型处理图片理解
2. **对话搜索**：全文检索历史对话和消息
3. **用户认证**：JWT + OAuth2，多用户支持
4. **对话导出**：导出为 Markdown / PDF
5. **主题切换**：亮色 / 暗色模式
6. **插件市场**：用户自定义工具
7. **性能优化**：消息分页加载、WebSocket 双向通信
8. **部署监控**：Prometheus + Grafana

## 下一步

恭喜完成 Agent Demo 项目！你现在拥有了：
- 一个完整的 AI 聊天应用
- 12 章详细教程文档
- 47 个自动化测试
- 可扩展的插件架构

继续探索：
- 添加更多工具（代码解释、数据分析）
- 集成其他 LLM（OpenAI、Anthropic）
- 实现 Agent 自主决策（ReAct、Tool Calling）
- 构建多用户协作功能

祝编码愉快！🚀
