# 第八章：前端基础布局

## 目标

搭建前端基础布局，包含侧边栏（对话列表）和聊天区域，使用 Zustand 管理状态。

## 技术栈

| 库 | 用途 |
|---|------|
| Modern.js | 全栈 React 框架（类似 Next.js） |
| Arco Design | UI 组件库（字节跳动出品） |
| TailwindCSS | 工具类 CSS（布局、间距） |
| Zustand | 轻量状态管理（比 Redux 简单） |
| openapi-fetch | 类型安全的 API 客户端 |

## 状态管理设计

使用 Zustand 按领域拆分为 3 个 store：

### conversationStore

```typescript
interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
}
```

### messageStore

```typescript
interface MessageState {
  messages: Record<string, Message[]>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  appendToMessage: (conversationId: string, messageId: string, content: string) => void;
}
```

### uiStore

```typescript
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}
```

## 布局结构

```
┌─────────────────────────────────────────┐
│           RootLayout                    │
│  ┌──────────┬──────────────────────┐   │
│  │ Sidebar  │     ChatArea         │   │
│  │          │  ┌────────────────┐  │   │
│  │ [新对话] │  │  MessageList   │  │   │
│  │          │  │                │  │   │
│  │ 对话1    │  │  用户消息      │  │   │
│  │ 对话2    │  │  AI 回复       │  │   │
│  │ 对话3    │  │                │  │   │
│  │          │  └────────────────┘  │   │
│  │          │  ┌────────────────┐  │   │
│  │          │  │   InputBox     │  │   │
│  │          │  └────────────────┘  │   │
│  └──────────┴──────────────────────┘   │
└─────────────────────────────────────────┘
```

## 组件拆分

```
src/
├── routes/
│   └── layout.tsx           # 根布局
├── features/
│   └── chat/
│       └── components/
│           ├── Sidebar.tsx           # 侧边栏
│           ├── ConversationList.tsx  # 对话列表
│           ├── ConversationItem.tsx  # 对话条目
│           ├── ChatArea.tsx          # 聊天区域
│           ├── MessageList.tsx       # 消息列表
│           └── InputBox.tsx          # 输入框
├── stores/
│   ├── conversationStore.ts
│   ├── messageStore.ts
│   └── uiStore.ts
└── api/
    ├── client.ts              # openapi-fetch 客户端
    └── conversation.ts        # 对话 API 封装
```

## Sidebar 实现

```typescript
export default function Sidebar() {
  const [loading, setLoading] = useState(false);
  const { conversations, setConversations, addConversation, setActiveConversation } =
    useConversationStore();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleNewConversation = async () => {
    setLoading(true);
    try {
      const conversation = await createConversation();
      addConversation(conversation);
      setActiveConversation(conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sider width={280} className="flex flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">对话</h2>
        <Button
          type="primary"
          icon={<IconPlus />}
          size="small"
          loading={loading}
          onClick={handleNewConversation}
        >
          新对话
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConversationList />
      </div>
    </Sider>
  );
}
```

## ChatArea 实现

```typescript
export default function ChatArea() {
  const { activeConversationId } = useConversationStore();

  if (!activeConversationId) {
    return (
      <Content className="flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <div className="text-lg">选择一个对话或创建新对话开始聊天</div>
        </div>
      </Content>
    );
  }

  return (
    <Content className="flex flex-col bg-white">
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      <div className="border-t border-gray-200">
        <InputBox />
      </div>
    </Content>
  );
}
```

## API 客户端

使用 `openapi-fetch` 实现类型安全的 API 调用：

```typescript
// api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from '@/types/api';

const client = createClient<paths>({
  baseUrl: '/api',
});

export default client;

// api/conversation.ts
export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await client.GET('/api/conversations/');
  return data || [];
}

export async function createConversation(title?: string): Promise<Conversation> {
  const { data } = await client.POST('/api/conversations/', {
    body: { title: title || '新对话' },
  });
  return data!;
}
```

## 运行前端

```bash
cd frontend
pnpm dev
```

访问 http://localhost:3000 查看效果。

## 本章新增文件

```
frontend/src/
├── routes/
│   └── layout.tsx                    # 根布局（Sidebar + ChatArea）
├── features/
│   └── chat/
│       └── components/
│           ├── index.ts
│           ├── Sidebar.tsx           # 侧边栏
│           ├── ConversationList.tsx  # 对话列表
│           ├── ConversationItem.tsx  # 对话条目（删除按钮）
│           ├── ChatArea.tsx          # 聊天区域
│           ├── MessageList.tsx       # 消息列表（简单版）
│           └── InputBox.tsx          # 输入框（简单版）
├── stores/
│   ├── index.ts
│   ├── conversationStore.ts          # 对话状态
│   ├── messageStore.ts               # 消息状态
│   └── uiStore.ts                    # UI 状态
├── api/
│   ├── client.ts                     # openapi-fetch 客户端
│   └── conversation.ts               # 对话 API
└── types/
    └── api.d.ts                      # 手动定义的类型（后续自动生成）
```

## 下一章：对话管理 UI

完善对话的增删改查 UI，包括：
- 对话标题编辑
- 对话删除确认
- 消息加载和显示
