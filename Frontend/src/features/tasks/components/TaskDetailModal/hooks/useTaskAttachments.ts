import { useState, useCallback } from 'react';
import type { Attachment } from '../types/taskDetail.types';

export function useTaskAttachments(initialAttachments: Attachment[]) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [editingAttachment, setEditingAttachment] = useState<string | null>(null);
  const [editAttachmentName, setEditAttachmentName] = useState('');
  const [editAttachmentUrl, setEditAttachmentUrl] = useState('');

  const startEditAttachment = useCallback((attachment: Attachment) => {
    setEditingAttachment(attachment.id);
    setEditAttachmentName(attachment.name);
    setEditAttachmentUrl(attachment.url);
  }, []);

  const saveEditAttachment = useCallback((attachmentId: string) => {
    setAttachments(prev => prev.map(a => a.id === attachmentId ? { ...a, name: editAttachmentName, url: editAttachmentUrl } : a));
    setEditingAttachment(null);
  }, [editAttachmentName, editAttachmentUrl]);

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, []);

  return {
    attachments,
    setAttachments,
    editingAttachment,
    editAttachmentName,
    editAttachmentUrl,
    setEditAttachmentName,
    setEditAttachmentUrl,
    setEditingAttachment,
    startEditAttachment,
    saveEditAttachment,
    removeAttachment,
  };
}

