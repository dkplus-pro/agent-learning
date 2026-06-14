/** 将音频 Blob 上传到后端进行语音识别，返回转写文本 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  // In development, use the backend URL directly
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : '';

  const response = await fetch(`${baseUrl}/api/asr/transcribe`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transcription failed: ${response.status}`);
  }

  const { text } = await response.json();
  return text;
}
