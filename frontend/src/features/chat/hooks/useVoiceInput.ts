import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/api/asr';

interface UseVoiceInputResult {
  isRecording: boolean;
  isTranscribing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
}

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Transcribe
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
