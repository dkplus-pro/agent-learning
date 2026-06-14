import { useState, useCallback } from 'react';

/** 附件数据结构 */
export interface Attachment {
  file: File;
  preview?: string;
}

interface UseAttachmentResult {
  attachments: Attachment[];
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
}

/**
 * 附件管理 Hook，提供附件的增删清空功能。
 * 对于图片文件，自动生成 data URL 预览；其他文件则无预览。
 *
 * @returns 附件列表及 addAttachment、removeAttachment、clearAttachments 方法
 */
export function useAttachment(): UseAttachmentResult {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const addAttachment = useCallback((file: File) => {
    const attachment: Attachment = { file };

    // 图片文件生成预览缩略图
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
