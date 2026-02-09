import { useTheme } from '@/core/theme/ThemeContext';
import {
  Archive,
  ArrowUpDown,
  Check,
  Copy,
  Download,
  File,
  FileCode,
  FileText,
  Folder,
  FolderPlus,
  Grid3x3,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  MoreVertical,
  Music,
  Plus,
  Search,
  Share2,
  SortAsc,
  Star,
  Trash2,
  Upload,
  UploadCloud,
  Users,
  Video,
  X
} from 'lucide-react';
import { useState } from 'react';
interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'doc' | 'image' | 'video' | 'audio' | 'code' | 'archive' | 'pdf' | 'text';
  owner: { name: string; avatar: string };
  dateModified: Date;
  size: string;
  starred?: boolean;
  shared?: boolean;
  shareLink?: string;
  color?: string;
  url?: string;
  parentId?: string | null;
}
export function Drive() {
  const { theme } = useTheme();
  const [selectedSection, setSelectedSection] = useState('My Drive');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [breadcrumb, setBreadcrumb] = useState<{id: string | null, name: string}[]>([{id: null, name: 'My Drive'}]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const [files, setFiles] = useState<DriveFile[]>([
    { 
      id: '1', 
      name: 'Project Documents', 
      type: 'folder', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-11-03'), 
      size: '—',
      color: '#00C6FF',
      starred: false,
      shared: false,
      parentId: null
    },
    { 
      id: '2', 
      name: 'Marketing Campaign 2024', 
      type: 'folder', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-11-02'), 
      size: '—',
      color: '#9D50BB',
      starred: false,
      shared: false,
      parentId: null
    },
    { 
      id: '3', 
      name: 'AI Project Documentation.pdf', 
      type: 'pdf', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-11-01'), 
      size: '2.3 MB',
      starred: true,
      shared: false
    },
    { 
      id: '4', 
      name: 'Q4 Financial Report.xlsx', 
      type: 'doc', 
      owner: { name: 'Sarah Smith', avatar: 'SS' }, 
      dateModified: new Date('2025-10-30'), 
      size: '1.8 MB',
      shared: true,
      starred: false,
      shareLink: 'https://drive.flowversal.com/share/abc123'
    },
    { 
      id: '5', 
      name: 'Product Presentation.pptx', 
      type: 'doc', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-10-28'), 
      size: '5.2 MB',
      starred: false,
      shared: false
    },
    { 
      id: '6', 
      name: 'Team Photo 2024.jpg', 
      type: 'image', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-10-25'), 
      size: '3.4 MB',
      starred: true,
      shared: false
    },
    { 
      id: '7', 
      name: 'Tutorial Video.mp4', 
      type: 'video', 
      owner: { name: 'John Doe', avatar: 'JD' }, 
      dateModified: new Date('2025-10-20'), 
      size: '45.8 MB',
      shared: true,
      starred: false,
      shareLink: 'https://drive.flowversal.com/share/xyz789'
    },
    { 
      id: '8', 
      name: 'Design Assets', 
      type: 'folder', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-10-15'), 
      size: '—',
      color: '#10B981',
      starred: true,
      shared: false,
      parentId: null
    },
    { 
      id: '9', 
      name: 'Source Code Archive.zip', 
      type: 'archive', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-10-10'), 
      size: '12.5 MB',
      starred: false,
      shared: false
    },
    { 
      id: '10', 
      name: 'app.tsx', 
      type: 'code', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-10-05'), 
      size: '45 KB',
      starred: false,
      shared: false
    },
    { 
      id: '11', 
      name: 'Podcast Episode 01.mp3', 
      type: 'audio', 
      owner: { name: 'me', avatar: 'M' }, 
      dateModified: new Date('2025-09-28'), 
      size: '8.7 MB',
      starred: false,
      shared: false
    }
  ]);
  const getFileIcon = (file: DriveFile) => {
    const iconClass = "w-5 h-5";
    switch (file.type) {
      case 'folder':
        return <Folder className={iconClass} style={{ color: file.color || '#00C6FF' }} />;
      case 'doc':
        return <FileText className={`${iconClass} text-[#4F7BF7]`} />;
      case 'image':
        return <ImageIcon className={`${iconClass} text-[#10B981]`} />;
      case 'video':
        return <Video className={`${iconClass} text-[#EF4444]`} />;
      case 'audio':
        return <Music className={`${iconClass} text-[#F59E0B]`} />;
      case 'code':
        return <FileCode className={`${iconClass} text-[#8B5CF6]`} />;
      case 'archive':
        return <Archive className={`${iconClass} text-[#6B7280]`} />;
      case 'pdf':
        return <File className={`${iconClass} text-[#EF4444]`} />;
      case 'text':
        return <FileText className={`${iconClass} text-[#6B7280]`} />;
      default:
        return <File className={`${iconClass} ${textSecondary}`} />;
    }
  };
  const getStoragePercentage = () => {
    return 77; // 77% full
  };
  const formatFileSize = (size: string) => {
    if (size === '—') return size;
    return size;
  };
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };
  const handleFileOpen = (file: DriveFile) => {
    if (file.type === 'folder') {
      // Navigate into folder
      setCurrentFolderId(file.id);
      setBreadcrumb([...breadcrumb, { id: file.id, name: file.name }]);
    } else {
      // Open or download file
      if (file.url) {
        window.open(file.url, '_blank');
      } else {
        alert(`Opening ${file.name}...`);
      }
    }
  };
  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id);
  };
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: DriveFile = {
        id: `folder-${Date.now()}`,
        name: newFolderName,
        type: 'folder',
        owner: { name: 'me', avatar: 'M' },
        dateModified: new Date(),
        size: '—',
        color: '#00C6FF',
        starred: false,
        shared: false,
        parentId: currentFolderId
      };
      setFiles([newFolder, ...files]);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };
  const handleFileUpload = () => {
    // Simulate file upload
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newFile: DriveFile = {
          id: `file-${Date.now()}`,
          name: file.name,
          type: 'doc', // Simplified type detection
          owner: { name: 'me', avatar: 'M' },
          dateModified: new Date(),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          starred: false,
          shared: false,
          parentId: currentFolderId
        };
        setFiles([newFile, ...files]);
        setShowUploadModal(false);
      }
    };
    fileInput.click();
  };
  const toggleStarred = (fileId: string) => {
    setFiles(files.map(file =>
      file.id === fileId ? { ...file, starred: !file.starred } : file
    ));
  };
  const generateShareLink = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return '';
    const randomId = Math.random().toString(36).substring(7);
    return `https://drive.flowversal.com/share/${randomId}`;
  };
  const handleShare = (fileId: string) => {
    const shareLink = generateShareLink(fileId);
    setFiles(files.map(file =>
      file.id === fileId ? { ...file, shared: true, shareLink } : file
    ));
    setShowShareModal(fileId);
  };
  const copyShareLink = (link: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link)
        .then(() => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
        })
        .catch(() => {
          // Fallback to old method
          fallbackCopyToClipboard(link);
        });
    } else {
      // Use fallback for older browsers or when clipboard API is blocked
      fallbackCopyToClipboard(link);
    }
  };
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
    document.body.removeChild(textArea);
  };
  const handleDelete = () => {
    setFiles(files.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };
  // Filter files based on selected section, search query, and current folder
  const getFilteredFiles = () => {
    let filtered = [...files];
    // Filter by section or folder structure
    if (searchQuery.trim()) {
       // When searching, show all matching files regardless of folder structure
       // but potentially filtered by section if we were to keep section logic strict
    } else {
      // Navigation logic
      if (selectedSection === 'My Drive') {
         filtered = filtered.filter(f => f.parentId === currentFolderId || (!f.parentId && currentFolderId === null));
      }
    }
    // Filter by section specific logic (merging with folder logic)
    if (selectedSection === 'Starred') {
      filtered = files.filter(f => f.starred); // Ignore folder structure for Starred
    } else if (selectedSection === 'Shared with me') {
      filtered = files.filter(f => f.shared); // Ignore folder structure
    } else if (selectedSection === 'Recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = files.filter(f => f.dateModified >= sevenDaysAgo); // Ignore folder structure
    }
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };
  const sortedFiles = getFilteredFiles().sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return b.dateModified.getTime() - a.dateModified.getTime();
      case 'size':
        if (a.size === '—') return 1;
        if (b.size === '—') return -1;
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });
  const starredCount = files.filter(f => f.starred).length;
  return (
    <div className={`flex h-screen ${bgMain} transition-colors duration-300`}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4`}>
          {/* Search and Actions */}
          <div className="flex items-center gap-4 mb-4">
            {/* New Button */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all font-medium text-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
            {/* Search Bar */}
            <div className={`flex-1 max-w-2xl flex items-center gap-3 px-4 py-2.5 rounded-lg border ${borderColor} ${hoverBg} transition-all`}>
              <Search className={`w-5 h-5 ${textSecondary}`} />
              <input
                type="text"
                placeholder="Search in Drive"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${textPrimary} placeholder:${textSecondary}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`p-1 rounded ${hoverBg}`}>
                  <X className={`w-4 h-4 ${textSecondary}`} />
                </button>
              )}
            </div>
            {/* Storage Bar */}
            <div className="flex-1 flex items-center justify-end px-4">
               <div className="w-full max-w-[200px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs ${textSecondary}`}>Storage</span>
                    <span className={`text-xs ${textPrimary}`}>750 MB of 1 GB</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} overflow-hidden`}>
                    <div 
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
               </div>
            </div>
            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-6">
              {/* Sort */}
              <div className="relative">
                <button 
                  onClick={() => setSortBy(prev => prev === 'name' ? 'date' : prev === 'date' ? 'size' : 'name')}
                  className={`p-2 rounded-lg ${hoverBg} transition-all`}
                  title={`Sort by ${sortBy}`}
                >
                  <SortAsc className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>
              {/* View Toggle */}
              <div className={`flex items-center gap-1 p-1 rounded-lg border ${borderColor}`}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20' : ''}`}
                >
                  <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[#00C6FF]' : textSecondary}`} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20' : ''}`}
                >
                  <Grid3x3 className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#00C6FF]' : textSecondary}`} />
                </button>
              </div>
            </div>
          </div>
          {/* Current View Title - Removed per request */}
          <div className="flex items-center justify-between">
            <span className={`text-sm ${textSecondary}`}>
              {sortedFiles.length} {sortedFiles.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
            {/* Breadcrumbs */}
            {selectedSection === 'My Drive' && !searchQuery && (
              <div className="flex items-center gap-2 mb-4 px-6 pt-4 text-sm">
                {breadcrumb.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <span className={`${textSecondary}`}>/</span>}
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`${
                        index === breadcrumb.length - 1
                          ? `${textPrimary} font-medium`
                          : `${textSecondary} hover:${textPrimary}`
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* File List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Selected Files Actions */}
          {selectedFiles.length > 0 && (
            <div className={`${bgPanel} rounded-lg px-4 py-3 mb-4 flex items-center justify-between`}>
              <span className={`${textPrimary} text-sm`}>
                {selectedFiles.length} item{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded ${hoverBg}`} title="Download">
                  <Download className={`w-4 h-4 ${textSecondary}`} />
                </button>
                <button 
                  onClick={() => {
                    if (selectedFiles.length === 1) {
                      handleShare(selectedFiles[0]);
                    }
                  }}
                  className={`p-2 rounded ${hoverBg}`} 
                  title="Share"
                >
                  <Share2 className={`w-4 h-4 ${textSecondary}`} />
                </button>
                <button 
                  onClick={handleDelete}
                  className={`p-2 rounded ${hoverBg}`} 
                  title="Delete"
                >
                  <Trash2 className={`w-4 h-4 text-red-500`} />
                </button>
                <button 
                  onClick={() => setSelectedFiles([])}
                  className={`p-2 rounded ${hoverBg}`}
                >
                  <X className={`w-4 h-4 ${textSecondary}`} />
                </button>
              </div>
            </div>
          )}
          {/* No Results */}
          {sortedFiles.length === 0 && (
            <div className={`flex flex-col items-center justify-center py-16 ${textSecondary}`}>
              <Folder className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg mb-2">No files found</p>
              {searchQuery && (
                <p className="text-sm">Try adjusting your search</p>
              )}
            </div>
          )}
          {viewMode === 'list' && sortedFiles.length > 0 ? (
            <div>
              {/* Table Header */}
              <div className={`grid grid-cols-12 gap-4 px-4 py-2 border-b ${borderColor} ${textSecondary} text-sm mb-2`}>
                <div className="col-span-5 flex items-center gap-2">
                  <span>Name</span>
                  <ArrowUpDown className="w-4 h-4 cursor-pointer" onClick={() => setSortBy('name')} />
                </div>
                <div className="col-span-3">Owner</div>
                <div className="col-span-2 flex items-center gap-2">
                  <span>Modified</span>
                  <ArrowUpDown className="w-4 h-4 cursor-pointer" onClick={() => setSortBy('date')} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <span>Size</span>
                  <ArrowUpDown className="w-4 h-4 cursor-pointer" onClick={() => setSortBy('size')} />
                </div>
              </div>
              {/* File Rows */}
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg ${hoverBg} transition-all cursor-pointer group ${
                    selectedFiles.includes(file.id) ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded cursor-pointer"
                    />
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer" 
                      onClick={() => handleFileOpen(file)}
                    >
                      {getFileIcon(file)}
                      <span className={textPrimary}>{file.name}</span>
                      <div className="flex items-center gap-1">
                        {file.starred && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {file.shared && (
                          <Users className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div 
                    className={`col-span-3 flex items-center ${textSecondary} text-sm cursor-pointer`}
                    onClick={() => handleFileOpen(file)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white text-xs">
                        {file.owner.avatar}
                      </div>
                      {file.owner.name}
                    </div>
                  </div>
                  <div 
                    className={`col-span-2 ${textSecondary} text-sm cursor-pointer`}
                    onClick={() => handleFileOpen(file)}
                  >
                    {formatDate(file.dateModified)}
                  </div>
                  <div className={`col-span-2 ${textSecondary} text-sm flex items-center justify-between`}>
                    <span 
                      className="cursor-pointer"
                      onClick={() => handleFileOpen(file)}
                    >
                      {formatFileSize(file.size)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarred(file.id);
                        }}
                        className={`p-1 rounded ${hoverBg}`}
                        title={file.starred ? 'Remove from starred' : 'Add to starred'}
                      >
                        <Star className={`w-4 h-4 ${file.starred ? 'text-yellow-500 fill-yellow-500' : textSecondary}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(file.id);
                        }}
                        className={`p-1 rounded ${hoverBg}`}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className={`p-1 rounded ${hoverBg}`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedFiles.length > 0 ? (
            /* Grid View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {sortedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`${bgCard} rounded-lg border ${borderColor} p-4 ${hoverBg} transition-all cursor-pointer group relative ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleFileOpen(file)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 left-3 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                  />
                  {/* File Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg ${file.type === 'folder' ? '' : bgPanel} flex items-center justify-center`}>
                      <div style={{ fontSize: '2rem' }}>
                        {getFileIcon(file)}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarred(file.id);
                        }}
                        className={`p-1 rounded ${hoverBg}`}
                        title={file.starred ? 'Remove from starred' : 'Add to starred'}
                      >
                        <Star className={`w-4 h-4 ${file.starred ? 'text-yellow-500 fill-yellow-500' : textSecondary}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(file.id);
                        }}
                        className={`p-1 rounded ${hoverBg}`}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* File Name */}
                  <h4 className={`${textPrimary} text-sm mb-2 truncate`} title={file.name}>
                    {file.name}
                  </h4>
                  {/* File Info */}
                  <div className={`${textSecondary} text-xs flex items-center gap-2`}>
                    <span>{formatDate(file.dateModified)}</span>
                    {file.size !== '—' && (
                      <>
                        <span>•</span>
                        <span>{file.size}</span>
                      </>
                    )}
                  </div>
                  {/* Tags */}
                  <div className="mt-2 flex items-center gap-1">
                    {file.starred && (
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    )}
                    {file.shared && (
                      <Users className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {/* Upload Modal */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className={`${bgCard} rounded-xl w-full max-w-md border ${borderColor} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${textPrimary} text-xl`}>New</h2>
              <button onClick={() => setShowUploadModal(false)} className={`p-1 rounded ${hoverBg}`}>
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setShowNewFolderModal(true);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary}`}
              >
                <FolderPlus className="w-5 h-5 text-[#00C6FF]" />
                <span>New Folder</span>
              </button>
              <button 
                onClick={handleFileUpload}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary}`}
              >
                <Upload className="w-5 h-5 text-[#9D50BB]" />
                <span>File Upload</span>
              </button>
              <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary}`}>
                <UploadCloud className="w-5 h-5 text-[#10B981]" />
                <span>Folder Upload</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewFolderModal(false)}
        >
          <div 
            className={`${bgCard} rounded-xl w-full max-w-md border ${borderColor} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${textPrimary} text-xl`}>New Folder</h2>
              <button onClick={() => setShowNewFolderModal(false)} className={`p-1 rounded ${hoverBg}`}>
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none mb-4`}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  newFolderName.trim()
                    ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50'
                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                } transition-all`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Share Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShareModal(null)}
        >
          <div 
            className={`${bgCard} rounded-xl w-full max-w-lg border ${borderColor} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${textPrimary} text-xl`}>Share</h2>
              <button onClick={() => setShowShareModal(null)} className={`p-1 rounded ${hoverBg}`}>
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>
            {(() => {
              const file = files.find(f => f.id === showShareModal);
              if (!file) return null;
              return (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    {getFileIcon(file)}
                    <div>
                      <h3 className={`${textPrimary}`}>{file.name}</h3>
                      <p className={`${textSecondary} text-sm`}>{file.type}</p>
                    </div>
                  </div>
                  {file.shareLink && (
                    <div className="mb-6">
                      <label className={`block text-sm ${textSecondary} mb-2`}>Public Link</label>
                      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${borderColor} ${bgPanel}`}>
                        <LinkIcon className={`w-4 h-4 ${textSecondary} flex-shrink-0`} />
                        <input
                          type="text"
                          value={file.shareLink}
                          readOnly
                          className={`flex-1 bg-transparent outline-none ${textPrimary} text-sm`}
                        />
                        <button
                          onClick={() => copyShareLink(file.shareLink!)}
                          className="px-3 py-1.5 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm ${textSecondary} mb-2`}>Share with people</label>
                      <input
                        type="email"
                        placeholder="Enter email addresses..."
                        className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${textSecondary}`}>Anyone with the link can view</span>
                      <button className="text-sm text-blue-500 hover:underline">
                        Change
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowShareModal(null)}
                      className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg}`}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
                    >
                      Send
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}