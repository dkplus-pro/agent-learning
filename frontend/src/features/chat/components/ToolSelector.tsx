import { Select } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import type { Tool } from '@/types/api';
import { fetchTools } from '@/api/tools';

interface Props {
  value: string | null;
  onChange: (toolId: string | null) => void;
  disabled?: boolean;
}

export default function ToolSelector({ value, onChange, disabled }: Props) {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const data = await fetchTools();
      setTools(data);
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  return (
    <Select
      value={value || 'default'}
      onChange={(val) => onChange(val === 'default' ? null : val)}
      size="small"
      disabled={disabled}
      className="w-32"
    >
      <Select.Option value="default">默认对话</Select.Option>
      {tools.map((tool) => (
        <Select.Option key={tool.id} value={tool.id}>
          {tool.name}
        </Select.Option>
      ))}
    </Select>
  );
}
