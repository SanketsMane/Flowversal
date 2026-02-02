import { 
  MessageSquare, Mail, Send, Phone, Video, Calendar, FileText,
  Users, Briefcase, Database, Globe, Code, Settings, Bell, Bot
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ToolTemplate {
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  description: string;
  defaultConfig: Record<string, any>;
  subcategory?: string;
}

export interface ToolCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  subcategories?: ToolSubCategory[];
}

export interface ToolSubCategory {
  id: string;
  label: string;
  toolTypes: string[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'communication',
    label: 'Communication',
    description: 'Send messages, emails, and notifications',
    icon: MessageSquare,
    subcategories: [
      {
        id: 'messaging',
        label: 'Messaging',
        toolTypes: ['slack', 'discord', 'telegram', 'whatsapp_business', 'microsoft_teams']
      },
      {
        id: 'email',
        label: 'Email',
        toolTypes: ['gmail', 'microsoft_outlook', 'sendgrid']
      },
      {
        id: 'chat',
        label: 'Chat & Collaboration',
        toolTypes: ['google_chat', 'zoom']
      }
    ]
  },
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Work with documents, spreadsheets, and tasks',
    icon: Briefcase,
    subcategories: [
      {
        id: 'spreadsheets',
        label: 'Spreadsheets',
        toolTypes: ['google_sheets', 'microsoft_excel', 'airtable']
      },
      {
        id: 'documents',
        label: 'Documents & Notes',
        toolTypes: ['google_docs', 'notion', 'confluence']
      },
      {
        id: 'project_management',
        label: 'Project Management',
        toolTypes: ['asana', 'trello', 'jira', 'monday']
      }
    ]
  },
  {
    id: 'data_storage',
    label: 'Data & Storage',
    description: 'Store and retrieve data',
    icon: Database,
    subcategories: [
      {
        id: 'databases',
        label: 'Databases',
        toolTypes: ['postgresql', 'mysql', 'mongodb', 'supabase']
      },
      {
        id: 'cloud_storage',
        label: 'Cloud Storage',
        toolTypes: ['google_drive', 'dropbox', 'onedrive']
      }
    ]
  },
  {
    id: 'other',
    label: 'Other Tools',
    description: 'Additional integrations and services',
    icon: Globe
  }
];

export const toolTemplates: ToolTemplate[] = [
  // Communication - Messaging
  {
    type: 'slack',
    label: 'Slack',
    category: 'communication',
    subcategory: 'messaging',
    icon: MessageSquare,
    description: 'Send messages, create channels, manage users',
    defaultConfig: {
      action: 'send_message',
      channel: '',
      message: '',
    },
  },
  {
    type: 'discord',
    label: 'Discord',
    category: 'communication',
    subcategory: 'messaging',
    icon: MessageSquare,
    description: 'Send messages to Discord channels',
    defaultConfig: {
      action: 'send_message',
      channel: '',
      message: '',
    },
  },
  {
    type: 'telegram',
    label: 'Telegram',
    category: 'communication',
    subcategory: 'messaging',
    icon: Send,
    description: 'Send messages via Telegram bot',
    defaultConfig: {
      action: 'send_message',
      chatId: '',
      message: '',
    },
  },
  {
    type: 'whatsapp_business',
    label: 'WhatsApp Business Cloud',
    category: 'communication',
    subcategory: 'messaging',
    icon: Phone,
    description: 'Send WhatsApp messages via Business API',
    defaultConfig: {
      action: 'send_message',
      phoneNumber: '',
      message: '',
    },
  },
  {
    type: 'microsoft_teams',
    label: 'Microsoft Teams',
    category: 'communication',
    subcategory: 'messaging',
    icon: Users,
    description: 'Send messages and notifications to Teams',
    defaultConfig: {
      action: 'send_message',
      channel: '',
      message: '',
    },
  },

  // Communication - Email
  {
    type: 'gmail',
    label: 'Gmail',
    category: 'communication',
    subcategory: 'email',
    icon: Mail,
    description: 'Send and read emails via Gmail',
    defaultConfig: {
      action: 'send_email',
      to: '',
      subject: '',
      body: '',
    },
  },
  {
    type: 'microsoft_outlook',
    label: 'Microsoft Outlook',
    category: 'communication',
    subcategory: 'email',
    icon: Mail,
    description: 'Send and manage Outlook emails',
    defaultConfig: {
      action: 'send_email',
      to: '',
      subject: '',
      body: '',
    },
  },
  {
    type: 'sendgrid',
    label: 'SendGrid',
    category: 'communication',
    subcategory: 'email',
    icon: Send,
    description: 'Send transactional emails at scale',
    defaultConfig: {
      action: 'send_email',
      to: '',
      subject: '',
      body: '',
    },
  },

  // Communication - Chat
  {
    type: 'google_chat',
    label: 'Google Chat',
    category: 'communication',
    subcategory: 'chat',
    icon: MessageSquare,
    description: 'Send messages to Google Chat spaces',
    defaultConfig: {
      action: 'send_message',
      space: '',
      message: '',
    },
  },
  {
    type: 'zoom',
    label: 'Zoom',
    category: 'communication',
    subcategory: 'chat',
    icon: Video,
    description: 'Create meetings, send chat messages',
    defaultConfig: {
      action: 'create_meeting',
      topic: '',
      duration: 60,
    },
  },

  // Productivity - Spreadsheets
  {
    type: 'google_sheets',
    label: 'Google Sheets',
    category: 'productivity',
    subcategory: 'spreadsheets',
    icon: FileText,
    description: 'Read, write, and update spreadsheet data',
    defaultConfig: {
      action: 'read',
      spreadsheetId: '',
      range: '',
    },
  },
  {
    type: 'microsoft_excel',
    label: 'Microsoft Excel',
    category: 'productivity',
    subcategory: 'spreadsheets',
    icon: FileText,
    description: 'Work with Excel spreadsheets',
    defaultConfig: {
      action: 'read',
      workbookId: '',
      range: '',
    },
  },
  {
    type: 'airtable',
    label: 'Airtable',
    category: 'productivity',
    subcategory: 'spreadsheets',
    icon: Database,
    description: 'Create, read, update Airtable records',
    defaultConfig: {
      action: 'create_record',
      baseId: '',
      tableId: '',
    },
  },

  // Productivity - Documents
  {
    type: 'google_docs',
    label: 'Google Docs',
    category: 'productivity',
    subcategory: 'documents',
    icon: FileText,
    description: 'Create and edit Google Docs',
    defaultConfig: {
      action: 'create',
      title: '',
      content: '',
    },
  },
  {
    type: 'notion',
    label: 'Notion',
    category: 'productivity',
    subcategory: 'documents',
    icon: FileText,
    description: 'Create pages, databases, and update content',
    defaultConfig: {
      action: 'create_page',
      parentId: '',
      title: '',
    },
  },
  {
    type: 'confluence',
    label: 'Confluence',
    category: 'productivity',
    subcategory: 'documents',
    icon: FileText,
    description: 'Create and manage Confluence pages',
    defaultConfig: {
      action: 'create_page',
      spaceKey: '',
      title: '',
    },
  },

  // Productivity - Project Management
  {
    type: 'asana',
    label: 'Asana',
    category: 'productivity',
    subcategory: 'project_management',
    icon: Briefcase,
    description: 'Create tasks, projects, and manage workflows',
    defaultConfig: {
      action: 'create_task',
      projectId: '',
      name: '',
    },
  },
  {
    type: 'trello',
    label: 'Trello',
    category: 'productivity',
    subcategory: 'project_management',
    icon: Briefcase,
    description: 'Create cards, lists, and manage boards',
    defaultConfig: {
      action: 'create_card',
      listId: '',
      name: '',
    },
  },
  {
    type: 'jira',
    label: 'Jira',
    category: 'productivity',
    subcategory: 'project_management',
    icon: Briefcase,
    description: 'Create issues, manage sprints',
    defaultConfig: {
      action: 'create_issue',
      projectKey: '',
      summary: '',
    },
  },
  {
    type: 'monday',
    label: 'Monday.com',
    category: 'productivity',
    subcategory: 'project_management',
    icon: Briefcase,
    description: 'Create items, update boards',
    defaultConfig: {
      action: 'create_item',
      boardId: '',
      itemName: '',
    },
  },

  // Data & Storage - Databases
  {
    type: 'postgresql',
    label: 'PostgreSQL',
    category: 'data_storage',
    subcategory: 'databases',
    icon: Database,
    description: 'Execute queries on PostgreSQL databases',
    defaultConfig: {
      action: 'query',
      query: '',
    },
  },
  {
    type: 'mysql',
    label: 'MySQL',
    category: 'data_storage',
    subcategory: 'databases',
    icon: Database,
    description: 'Execute queries on MySQL databases',
    defaultConfig: {
      action: 'query',
      query: '',
    },
  },
  {
    type: 'mongodb',
    label: 'MongoDB',
    category: 'data_storage',
    subcategory: 'databases',
    icon: Database,
    description: 'Perform operations on MongoDB collections',
    defaultConfig: {
      action: 'find',
      collection: '',
      query: {},
    },
  },
  {
    type: 'supabase',
    label: 'Supabase',
    category: 'data_storage',
    subcategory: 'databases',
    icon: Database,
    description: 'Work with Supabase database and auth',
    defaultConfig: {
      action: 'select',
      table: '',
      filters: {},
    },
  },

  // Data & Storage - Cloud Storage
  {
    type: 'google_drive',
    label: 'Google Drive',
    category: 'data_storage',
    subcategory: 'cloud_storage',
    icon: FileText,
    description: 'Upload, download, and manage files',
    defaultConfig: {
      action: 'upload',
      fileName: '',
      folderId: '',
    },
  },
  {
    type: 'dropbox',
    label: 'Dropbox',
    category: 'data_storage',
    subcategory: 'cloud_storage',
    icon: FileText,
    description: 'Upload and manage Dropbox files',
    defaultConfig: {
      action: 'upload',
      path: '',
    },
  },
  {
    type: 'onedrive',
    label: 'OneDrive',
    category: 'data_storage',
    subcategory: 'cloud_storage',
    icon: FileText,
    description: 'Manage Microsoft OneDrive files',
    defaultConfig: {
      action: 'upload',
      path: '',
    },
  },
];

export function getToolsByCategory(category: string): ToolTemplate[] {
  return toolTemplates.filter(tool => tool.category === category);
}

export function searchTools(query: string): ToolTemplate[] {
  const lowerQuery = query.toLowerCase();
  return toolTemplates.filter(
    tool =>
      tool.label.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
  );
}
