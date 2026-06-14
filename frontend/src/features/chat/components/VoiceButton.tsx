import { Button, Tooltip } from '@arco-design/web-react';
import { IconVoice, IconLoading } from '@arco-design/web-react/icon';
import { useVoiceInput } from '@/features/chat/hooks';

interface Props {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

/**
 * 语音按钮组件 — 点击开始/停止录音，利用 useVoiceInput Hook 完成录音与转写。
 * 根据录音/转写状态动态展示图标、颜色和提示文案。
 */
export default function VoiceButton({ onTranscriptionComplete, disabled }: Props) {
  const { isRecording, isTranscribing, startRecording, stopRecording, error } =
    useVoiceInput(onTranscriptionComplete);

  const handleClick = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const isLoading = isRecording || isTranscribing;

  return (
    <Tooltip
      content={
        error
          ? error
          : isRecording
          ? '点击停止录音'
          : isTranscribing
          ? '正在识别...'
          : '点击开始录音'
      }
    >
      <Button
        type={isRecording ? 'primary' : 'default'}
        status={isRecording ? 'danger' : 'default'}
        icon={isLoading ? <IconLoading /> : <IconVoice />}
        onClick={handleClick}
        disabled={disabled && !isRecording}
        loading={isTranscribing}
      />
    </Tooltip>
  );
}
