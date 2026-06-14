import { Button, Image } from '@arco-design/web-react';
import { IconClose, IconFile } from '@arco-design/web-react/icon';
import type { Attachment } from '@/features/chat/hooks/useAttachment';

interface Props {
  attachments: Attachment[];
  onRemove: (index: number) => void;
}

export default function AttachmentPreview({ attachments, onRemove }: Props) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="relative group border border-gray-200 rounded-lg overflow-hidden"
        >
          {attachment.preview ? (
            <Image
              src={attachment.preview}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center bg-gray-50">
              <IconFile className="text-2xl text-gray-400" />
            </div>
          )}
          <Button
            type="primary"
            status="danger"
            size="mini"
            icon={<IconClose />}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 truncate">
            {attachment.file.name}
          </div>
        </div>
      ))}
    </div>
  );
}
