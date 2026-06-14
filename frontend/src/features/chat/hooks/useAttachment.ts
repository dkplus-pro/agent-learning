import { useState, useCallback } from 'react';

interface Attachment {
  file: File;
  preview?: string;
}

interface UseAttachmentResult {
  attachments: Attachment[];
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
}

export function useAttachment(): UseAttachmentResult {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const addAttachment = useCallback((file: File) => {
    const attachment: Attachment = { file };

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        attachment.preview = e.target?.result as string;
        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachments((prev) => [...prev, attachment]);
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  return {
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
  };
}
