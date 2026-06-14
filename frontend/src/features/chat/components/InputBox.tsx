import { Button, Input } from '@arco-design/web-react';
import { IconSend } from '@arco-design/web-react/icon';
import { useState } from 'react';

export default function InputBox() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }
    // TODO: Implement message sending in next commit
    console.log('Send message:', message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <Input.TextArea
          value={message}
          onChange={setMessage}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="flex-1"
        />
        <Button
          type="primary"
          icon={<IconSend />}
          onClick={handleSend}
          disabled={!message.trim()}
        />
      </div>
    </div>
  );
}
