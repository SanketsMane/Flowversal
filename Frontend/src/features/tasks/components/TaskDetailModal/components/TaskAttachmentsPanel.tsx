import { ChangeEvent } from 'react';
import { Edit2, Paperclip, Upload, X } from 'lucide-react';
import type { Attachment } from '../types/taskDetail.types';

interface TaskAttachmentsPanelProps {
  attachments: Attachment[];
  editingAttachment: string | null;
  editAttachmentName: string;
  editAttachmentUrl: string;
  setEditAttachmentName: (value: string) => void;
  setEditAttachmentUrl: (value: string) => void;
  setEditingAttachment: (value: string | null) => void;
  startEditAttachment: (attachment: Attachment) => void;
  saveEditAttachment: (attachmentId: string) => void;
  removeAttachment: (attachmentId: string) => void;
  showAttachmentMenu: boolean;
  setShowAttachmentMenu: (value: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  addAttachmentLink: () => void;
  linkName: string;
  setLinkName: (value: string) => void;
  linkUrl: string;
  setLinkUrl: (value: string) => void;
  bgCard: string;
  bgPanel: string;
  bgMain: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  hoverBg: string;
}

export function TaskAttachmentsPanel({
  attachments,
  editingAttachment,
  editAttachmentName,
  editAttachmentUrl,
  setEditAttachmentName,
  setEditAttachmentUrl,
  setEditingAttachment,
  startEditAttachment,
  saveEditAttachment,
  removeAttachment,
  showAttachmentMenu,
  setShowAttachmentMenu,
  fileInputRef,
  handleFileUpload,
  addAttachmentLink,
  linkName,
  setLinkName,
  linkUrl,
  setLinkUrl,
  bgCard,
  bgPanel,
  bgMain,
  textPrimary,
  textSecondary,
  borderColor,
  hoverBg
}: TaskAttachmentsPanelProps) {
  return (
    <div>
      <h3 className={`${textSecondary} text-xs sm:text-sm mb-2 mt-6`}>Attachments</h3>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div key={attachment.id}>
            {editingAttachment === attachment.id ? (
              <div className={`p-3 rounded-lg border ${borderColor} ${bgPanel} space-y-2`}>
                <input
                  type="text"
                  value={editAttachmentName}
                  onChange={(e) => setEditAttachmentName(e.target.value)}
                  className={`w-full px-2 py-1 rounded border ${borderColor} ${bgMain} ${textPrimary} text-sm outline-none`}
                  placeholder="Link name"
                />
                <input
                  type="url"
                  value={editAttachmentUrl}
                  onChange={(e) => setEditAttachmentUrl(e.target.value)}
                  className={`w-full px-2 py-1 rounded border ${borderColor} ${bgMain} ${textPrimary} text-sm outline-none`}
                  placeholder="URL"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEditAttachment(attachment.id)}
                    className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingAttachment(null)}
                    className={`px-3 py-1 rounded border ${borderColor} ${textSecondary} text-sm`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex items-center justify-between p-3 rounded-lg border ${borderColor} ${bgPanel} group`}>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 flex-1"
                >
                  <Paperclip className={`w-4 h-4 ${textPrimary}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`${textPrimary} text-sm truncate hover:underline`}>{attachment.name}</p>
                    {attachment.size && (
                      <p className={`${textSecondary} text-xs`}>{attachment.size}</p>
                    )}
                  </div>
                </a>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {attachment.type === 'link' && (
                    <button
                      onClick={() => startEditAttachment(attachment)}
                      className={`p-1 rounded ${hoverBg}`}
                      type="button"
                    >
                      <Edit2 className={`w-4 h-4 ${textSecondary}`} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(attachment.id);
                    }}
                    className={`p-1 rounded ${hoverBg}`}
                    type="button"
                  >
                    <X className={`w-4 h-4 ${textSecondary}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAttachmentMenu(false);
            }
          }}
        >
          <div
            className={`${bgCard} rounded-xl w-full max-w-md border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`${textPrimary}`}>Add Attachment</h3>
                <button onClick={() => setShowAttachmentMenu(false)} className={`p-1 rounded ${hoverBg}`} type="button">
                  <X className={`w-4 h-4 ${textSecondary}`} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${hoverBg}`}
                type="button"
              >
                <Upload className={`w-5 h-5 ${textSecondary}`} />
                <span className={`${textPrimary} text-sm`}>Upload from computer</span>
              </button>

              <div className="space-y-2">
                <label className={`block text-sm ${textSecondary}`}>Add link</label>
                <input
                  type="text"
                  placeholder="Link name (optional)"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none text-sm`}
                />
                <input
                  type="url"
                  placeholder="Paste link here..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none text-sm`}
                />
                <button
                  onClick={addAttachmentLink}
                  disabled={!linkUrl.trim()}
                  className={`w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all text-sm ${!linkUrl.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  type="button"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

