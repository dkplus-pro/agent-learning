import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/api/asr';

interface UseVoiceInputResult {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
}

/**
 * 语音输入 Hook，封装浏览器录音与后端语音识别（ASR）流程。
 * 使用 MediaRecorder API 录制音频，停止后将 Blob 发送至后端转写为文本，
 * 最后通过回调将识别结果返回给调用方。
 *
 * @param onTranscriptionComplete - 语音识别完成后的回调，接收识别出的文本
 * @returns 录音状态、转写状态、开始/停止录音方法及错误信息
 */
export function useVoiceInput(
  onTranscriptionComplete: (text: string) => void
): UseVoiceInputResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      // 获取麦克风权限并创建音频流
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      chunksRef.current = [];

      // 收集音频数据块
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // 停止后将数据块合并为 Blob
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // 释放麦克风资源
        stream.getTracks().forEach((track) => track.stop());

        // 发送 Blob 到后端进行语音识别
        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(audioBlob);
          onTranscriptionComplete(text);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
          setError(errorMessage);
          console.error('Transcription error:', err);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, [onTranscriptionComplete]);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    error,
  };
}
