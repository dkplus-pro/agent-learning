import { Layout } from '@arco-design/web-react';
import { useConversationStore } from '@/stores';
import MessageList from './MessageList';
import InputBox from './InputBox';

const { Content } = Layout;

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
