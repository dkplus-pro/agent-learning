import { useConversationStore } from '@/stores';
import MessageList from './MessageList';
import InputBox from './InputBox';

/**
 * 聊天主区域组件 — 根据是否有活跃对话，渲染消息列表 + 输入框或空状态引导页。
 * 无活跃对话时展示提示信息；有活跃对话时展示 MessageList 和 InputBox。
 */
export default function ChatArea() {
  const { activeConversationId } = useConversationStore();

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center" style={{ color: 'var(--color-muted-foreground)' }}>
          <div className="text-6xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-lg">选择一个对话或创建新对话开始聊天</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      <div className="flex-1 min-h-0">
        <MessageList />
      </div>
      <div style={{ borderTop: '1px solid var(--color-border)' }}>
        <InputBox />
      </div>
    </div>
  );
}
