import { useState } from 'react';
import { Users, Edit2, Trash2, Check, X } from 'lucide-react';
import type { Comment } from '../types/taskDetail.types';

interface TaskActivityPanelProps {
  comments: Comment[];
  addComment: () => void;
  deleteComment: (id: string) => void;
  updateComment: (id: string, text: string) => void;
  newComment: string;
  setNewComment: (value: string) => void;
  textPrimary: string;
  textSecondary: string;
  bgPanel: string;
  bgMain: string;
  borderColor: string;
}

export function TaskActivityPanel({
  comments,
  addComment,
  deleteComment,
  updateComment,
  newComment,
  setNewComment,
  textPrimary,
  textSecondary,
  bgPanel,
  bgMain,
  borderColor
}: TaskActivityPanelProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const saveEdit = () => {
    if (!editingCommentId) return;
    if (editingText.trim()) {
      updateComment(editingCommentId, editingText.trim());
    }
    cancelEdit();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${textSecondary}`} />
          <h3 className={`${textPrimary} text-sm sm:text-base`}>Activity</h3>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {comments.map(comment => {
          const isEditing = editingCommentId === comment.id;
          return (
            <div key={comment.id} className="flex gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${textPrimary} text-sm mb-1`}>{comment.author}</p>
                {isEditing ? (
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    className={`w-full rounded-lg border ${borderColor} ${bgMain} ${textPrimary} p-3 text-sm outline-none`}
                  />
                ) : (
                  <div className={`${bgPanel} rounded-lg p-3`}>
                    <p className={`${textPrimary} text-sm break-words`}>{comment.text}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className={`flex items-center gap-1 text-sm ${textSecondary} hover:text-[#00C6FF]`}
                        title="Save edit"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className={`flex items-center gap-1 text-sm ${textSecondary} hover:text-red-500`}
                        title="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(comment)}
                        className={`flex items-center gap-1 text-sm ${textSecondary} hover:text-[#00C6FF]`}
                        title="Edit comment"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className={`flex items-center gap-1 text-sm ${textSecondary} hover:text-red-500`}
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 sm:gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0">
          U
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none resize-none text-sm`}
            rows={2}
          />
          {newComment && (
            <button
              onClick={addComment}
              className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white text-sm hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

