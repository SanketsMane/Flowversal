import { useState, useCallback } from 'react';
import type { Comment } from '../types/taskDetail.types';

export function useTaskComments(initialComments: Comment[]) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  const addComment = useCallback(() => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      avatar: 'U',
      text: newComment,
      timestamp: new Date(),
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  }, [newComment]);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  const updateComment = useCallback((commentId: string, text: string) => {
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, text } : c))
    );
  }, []);

  return {
    comments,
    newComment,
    setNewComment,
    addComment,
    deleteComment,
    updateComment,
    setComments,
  };
}

