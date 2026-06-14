# 第九章：前端对话管理 UI

## 目标

完善对话管理功能，包括标题编辑、消息加载、对话切换。

## 对话标题编辑

### 编辑模式

点击编辑按钮后，标题变为输入框，支持：
- **Enter**：保存
- **Escape**：取消
- 点击 ✅ 保存
- 点击 ❌ 取消

```typescript
export default function ConversationItem({ conversation }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditing(false);
      return;
    }
    try {
      const updated = await updateConversation(conversation.id, editTitle.trim());
      updateStore(conversation.id, { title: updated.title });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 w-full py-2">
        <Input
          value={editTitle}
          onChange={setEditTitle}
          onKeyDown={handleKeyDown}
          size="small"
          autoFocus
          className="flex-1"
        />
        <Button type="text" size="mini" icon={<IconCheck />} onClick={handleSave} />
        <Button type="text" size="mini" icon={<IconClose />} onClick={handleCancel} />
      </div>
    );
  }

  // ... normal display mode
}
```

### 状态同步

编辑成功后，同时更新：
1. 后端数据库（`updateConversation` API）
2. 前端 store（`updateStore` action）

确保 UI 和数据一致。

## 消息加载

### 切换对话时加载

```typescript
export default function MessageList() {
  const { activeConversationId } = useConversationStore();
  const { messages, setMessages } = useMessageStore();

  useEffect(() => {
    if (activeConversationId) {
      loadMessages();
    }
  }, [activeConversationId]);

  const loadMessages = async () => {
    if (!activeConversationId) return;

    try {
      const data = await fetchMessages(activeConversationId);
      setMessages(activeConversationId, data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  // ...
}
```

### 三态处理

| 状态 | 显示 |
|------|------|
| `messages[id] === undefined` | Loading spinner |
| `messages[id].length === 0` | "还没有消息，开始对话吧！" |
| `messages[id].length > 0` | 消息列表 |

```typescript
const conversationMessages = messages[activeConversationId];

if (conversationMessages === undefined) {
  return <Spin />;
}

if (conversationMessages.length === 0) {
  return <div>还没有消息，开始对话吧！</div>;
}

return <MessageList />;
```

## 消息气泡样式

```typescript
<div
  className={`flex ${
    message.role === 'user' ? 'justify-end' : 'justify-start'
  }`}
>
  <div
    className={`max-w-[70%] rounded-lg px-4 py-2 ${
      message.role === 'user'
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-900'
    }`}
  >
    <div className="whitespace-pre-wrap">{message.content}</div>
  </div>
</div>
```

设计决策：
- **用户消息右对齐**：蓝色背景，白色文字
- **AI 回复左对齐**：灰色背景，黑色文字
- **最大宽度 70%**：防止单条消息过宽
- **pre-wrap**：保留换行和空格

## API 封装

```typescript
// api/message.ts
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data } = await client.GET('/api/messages/{conversation_id}', {
    params: { path: { conversation_id: conversationId } },
  });
  return data || [];
}

export async function createMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const { data } = await client.POST('/api/messages/', {
    body: {
      conversation_id: conversationId,
      role,
      content,
    },
  });
  return data!;
}
```

## 本章改进文件

```
frontend/src/
├── api/
│   └── message.ts                          # 消息 API 封装
└── features/
    └── chat/
        └── components/
            ├── ConversationItem.tsx        # 标题编辑功能
            └── MessageList.tsx             # 消息加载逻辑
```

## 下一章：聊天界面

实现完整的聊天功能：
- SSE 流式响应
- Markdown 渲染
- 虚拟滚动
- 发送消息
