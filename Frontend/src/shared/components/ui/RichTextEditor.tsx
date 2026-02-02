import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code, Copy, Check, Underline, Strikethrough } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  const bgMain = theme === 'dark' ? 'bg-[#13132B]' : 'bg-gray-50';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const bgCodeBlock = theme === 'dark' ? 'bg-[#0A0A1A]' : 'bg-gray-800';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  useEffect(() => {
    // Initialize content
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      const selection = window.getSelection();
      const range = savedSelection || (selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null);
      
      if (range) {
        const selectedText = linkText || linkUrl;
        
        range.deleteContents();
        
        const link = document.createElement('a');
        link.href = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
        link.textContent = selectedText;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.color = '#3B82F6';
        link.style.textDecoration = 'underline';
        link.style.cursor = 'pointer';
        
        range.insertNode(link);
        
        // Move cursor after the link
        if (selection) {
          range.setStartAfter(link);
          range.setEndAfter(link);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      
      setLinkUrl('');
      setLinkText('');
      setShowLinkInput(false);
      setSavedSelection(null);
      handleInput();
    }
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString() || 'Your code here...';
      
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = selectedText;
      pre.appendChild(code);
      pre.setAttribute('data-code-block', 'true');
      
      // Style the code block
      pre.style.cssText = `
        background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0.5rem 0;
        position: relative;
        border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        white-space: pre;
      `;
      
      range.deleteContents();
      range.insertNode(pre);
      
      // Move cursor inside the code element
      const newRange = document.createRange();
      newRange.selectNodeContents(code);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      handleInput();
    }
  };

  const copyCodeToClipboard = (code: string, codeId: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          setCopiedCode(codeId);
          setTimeout(() => setCopiedCode(null), 2000);
        })
        .catch(() => {
          // Fallback to legacy method
          fallbackCopy(code, codeId);
        });
    } else {
      // Use fallback for environments where Clipboard API is not available
      fallbackCopy(code, codeId);
    }
  };

  const fallbackCopy = (text: string, codeId: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  // Add copy buttons to code blocks after render
  useEffect(() => {
    if (editorRef.current) {
      const codeBlocks = editorRef.current.querySelectorAll('pre');
      codeBlocks.forEach((pre, index) => {
        const codeId = `code-${index}`;
        
        // Check if copy button already exists
        if (!pre.querySelector('.copy-code-btn')) {
          const copyBtn = document.createElement('button');
          copyBtn.className = 'copy-code-btn';
          copyBtn.innerHTML = copiedCode === codeId 
            ? '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>'
            : '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
          copyBtn.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.5rem;
            background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            color: ${theme === 'dark' ? '#fff' : '#000'};
            opacity: 0;
            transition: opacity 0.2s;
          `;
          
          copyBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const code = pre.textContent || '';
            copyCodeToClipboard(code, codeId);
          };
          
          pre.style.position = 'relative';
          pre.appendChild(copyBtn);
          
          // Show copy button on hover
          pre.addEventListener('mouseenter', () => {
            const btn = pre.querySelector('.copy-code-btn') as HTMLElement;
            if (btn) btn.style.opacity = '1';
          });
          pre.addEventListener('mouseleave', () => {
            const btn = pre.querySelector('.copy-code-btn') as HTMLElement;
            if (btn) btn.style.opacity = '0';
          });
        }
      });
    }
  }, [value, copiedCode, theme]);

  return (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-1 p-2 ${bgPanel} border-b ${borderColor} flex-wrap`}>
        <button
          onClick={() => execCommand('bold')}
          className={`p-2 rounded ${hoverBg} transition-colors`}
          title="Bold (Ctrl+B)"
          type="button"
        >
          <Bold className={`w-4 h-4 ${textSecondary}`} />
        </button>
        <button
          onClick={() => execCommand('italic')}
          className={`p-2 rounded ${hoverBg} transition-colors`}
          title="Italic (Ctrl+I)"
          type="button"
        >
          <Italic className={`w-4 h-4 ${textSecondary}`} />
        </button>
        <button
          onClick={() => execCommand('underline')}
          className={`p-2 rounded ${hoverBg} transition-colors`}
          title="Underline (Ctrl+U)"
          type="button"
        >
          <Underline className={`w-4 h-4 ${textSecondary}`} />
        </button>
        <button
          onClick={() => execCommand('strikeThrough')}
          className={`p-2 rounded ${hoverBg} transition-colors`}
          title="Strikethrough"
          type="button"
        >
          <Strikethrough className={`w-4 h-4 ${textSecondary}`} />
        </button>
        
        <div className={`w-px h-6 ${bgMain} mx-1`}></div>
        
        <button
          onClick={() => execCommand('insertUnorderedList')}
          className={`p-2 rounded ${hoverBg} transition-colors`}
          title="Bullet List"
          type="button"
        >
          <List className={`w-4 h-4 ${textSecondary}`} />
        </button>
        <button
          onClick={() => execCommand('insertOrderedList')}
          className={`p-2 rounded ${hoverBg} transition-colors`}
          title="Numbered List"
          type="button"
        >
          <ListOrdered className={`w-4 h-4 ${textSecondary}`} />
        </button>
        
        <div className={`w-px h-6 ${bgMain} mx-1`}></div>
        
        <button
          onClick={() => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const selectedText = selection.toString();
              
              // Save the selection and selected text
              setSavedSelection(range.cloneRange());
              if (selectedText) {
                setLinkText(selectedText);
              }
            }
            setShowLinkInput(!showLinkInput);
          }}
          className={`p-2 rounded ${hoverBg} transition-colors ${showLinkInput ? 'bg-blue-500/20' : ''}`}
          title="Insert Link"
          type="button"
        >
          <LinkIcon className={`w-4 h-4 ${showLinkInput ? 'text-blue-500' : textSecondary}`} />
        </button>
        <button
          onClick={insertCodeBlock}
          className={`p-2 rounded ${hoverBg} transition-colors`}
          title="Code Block"
          type="button"
        >
          <Code className={`w-4 h-4 ${textSecondary}`} />
        </button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className={`p-3 ${bgPanel} border-b ${borderColor} space-y-2`}>
          <div>
            <label className={`text-xs ${textSecondary} mb-1 block`}>Link Text</label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Text to display..."
              className={`w-full px-3 py-2 rounded-lg ${bgMain} ${textPrimary} text-sm outline-none border ${borderColor}`}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={`text-xs ${textSecondary} mb-1 block`}>URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className={`w-full px-3 py-2 rounded-lg ${bgMain} ${textPrimary} text-sm outline-none border ${borderColor}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    insertLink();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
                setLinkText('');
                setSavedSelection(null);
              }}
              className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} text-sm ${hoverBg}`}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={insertLink}
              disabled={!linkUrl.trim()}
              className={`px-4 py-2 rounded-lg text-white text-sm transition-colors ${
                linkUrl.trim() 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
              type="button"
            >
              Insert Link
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={(e) => {
          // Handle Enter key in code blocks
          if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              let node = range.startContainer;
              
              // Check if we're inside a code block
              while (node && node !== editorRef.current) {
                if (node.nodeName === 'PRE' || (node as HTMLElement).hasAttribute?.('data-code-block')) {
                  e.preventDefault();
                  // Insert a line break
                  document.execCommand('insertText', false, '\n');
                  return;
                }
                if (node.nodeName === 'CODE' && node.parentElement?.nodeName === 'PRE') {
                  e.preventDefault();
                  // Insert a line break
                  document.execCommand('insertText', false, '\n');
                  return;
                }
                node = node.parentNode as Node;
              }
            }
          }
        }}
        className={`w-full px-4 py-3 ${bgMain} ${textPrimary} outline-none min-h-[150px] text-sm`}
        data-placeholder={placeholder}
        style={{
          whiteSpace: 'pre-wrap',
          direction: 'ltr',
          textAlign: 'left',
        }}
      />

      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: ${theme === 'dark' ? '#CFCFE8' : '#9CA3AF'};
          opacity: 0.5;
          pointer-events: none;
        }
        [contentEditable] a {
          color: #3B82F6 !important;
          text-decoration: underline !important;
          cursor: pointer !important;
          pointer-events: auto !important;
        }
        [contentEditable] a:hover {
          color: #2563EB !important;
          text-decoration: underline !important;
        }
        [contentEditable] ul,
        [contentEditable] ol {
          padding-left: 2rem;
          margin: 0.75rem 0;
          list-style-position: outside;
        }
        [contentEditable] ul {
          list-style-type: disc;
        }
        [contentEditable] ol {
          list-style-type: decimal;
        }
        [contentEditable] li {
          margin: 0.5rem 0;
          padding-left: 0.25rem;
        }
        [contentEditable] pre {
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          padding: 1rem;
          padding-top: 2.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0.75rem 0;
          position: relative;
          border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          white-space: pre;
        }
        [contentEditable] pre code {
          background: transparent;
          padding: 0;
          border: none;
          font-family: inherit;
          display: block;
          white-space: pre;
        }
        [contentEditable] code {
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
        }
        [contentEditable] b,
        [contentEditable] strong {
          font-weight: 600;
        }
        [contentEditable] i,
        [contentEditable] em {
          font-style: italic;
        }
        [contentEditable] u {
          text-decoration: underline;
        }
        [contentEditable] strike,
        [contentEditable] s {
          text-decoration: line-through;
        }
        [contentEditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
