import { 
  GitBranch, Settings, Code, Repeat, Split, Merge, Globe, 
  Database, FileText, Cpu, Clock, AlertCircle, Workflow as WorkflowIcon,
  Mail, MessageSquare, Play, Circle, Sparkles, Bot, Pen, Users, Briefcase, 
  Package, Shield, User, Link, Scale, FileType, CalendarClock, Edit3, Filter, ArrowDown,
  HardDrive, ArrowRight, Plus
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NodeTemplate {
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  description: string;
  defaultConfig: Record<string, any>;
  subcategory?: string; // For organizing nodes within categories
  childNodes?: NodeTemplate[]; // For expandable nodes like Code
  isRecommended?: boolean; // For showing "Recommended" badge
  hasMoreOptions?: boolean; // For showing → arrow
}

export interface NodeCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  subcategories?: SubCategory[]; // For categories with subcategories like Data Transformation
  hasMoreOptions?: boolean; // For showing → arrow (like Action by tools)
}

export interface SubCategory {
  id: string;
  label: string;
  nodeTypes: string[]; // Node types belonging to this subcategory
}

export const nodeCategories: NodeCategory[] = [
  { 
    id: 'ai', 
    label: 'AI', 
    description: 'Build autonomous agents, summarize or search documents, etc.',
    icon: Bot
  },
  { 
    id: 'action', 
    label: 'Action by tools', 
    description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
    icon: Globe,
    hasMoreOptions: true // Shows → arrow
  },
  { 
    id: 'data', 
    label: 'Data transformation', 
    description: 'Manipulate, filter or convert data',
    icon: Pen,
    subcategories: [
      {
        id: 'popular',
        label: 'Popular',
        nodeTypes: ['ai_transform', 'code', 'date_time', 'edit_fields']
      },
      {
        id: 'add_remove',
        label: 'Add or remove items',
        nodeTypes: ['filter', 'limit']
      }
    ]
  },
  { 
    id: 'flow', 
    label: 'Flow', 
    description: 'Branch, merge or loop the flow, etc.',
    icon: GitBranch
  },
  { 
    id: 'core', 
    label: 'Core', 
    description: 'Run code, make HTTP requests, set webhooks, etc.',
    icon: Briefcase
  },
  { 
    id: 'human', 
    label: 'Human in the loop', 
    description: 'Wait for approval or human input before continuing',
    icon: Users
  },
  {
    id: 'add_trigger',
    label: 'Add Another Trigger',
    description: 'Add additional triggers to your workflow',
    icon: Plus,
    hasMoreOptions: true // Opens trigger panel
  },
];

export const nodeTemplates: NodeTemplate[] = [
  // Form Node
  {
    type: 'form',
    label: 'Form',
    category: 'action',
    icon: FileText,
    description: 'Build forms with custom fields and validations',
    defaultConfig: {
      formFields: [],
    },
  },
  
  // AI Nodes
  {
    type: 'ai_templates',
    label: 'AI Templates',
    category: 'ai',
    icon: Package,
    description: 'See what\'s possible and get started 5x faster',
    isRecommended: true,
    defaultConfig: {
      template: '',
    },
  },
  {
    type: 'openai',
    label: 'OpenAI',
    category: 'ai',
    icon: Bot,
    description: 'Message an assistant or GPT, analyze images, generate audio, etc.',
    isRecommended: true,
    defaultConfig: {
      model: 'gpt-4',
      prompt: '',
      temperature: 0.7,
    },
  },
  {
    type: 'basic_llm_chain',
    label: 'Basic LLM Chain',
    category: 'ai',
    icon: Link,
    description: 'A simple chain to prompt a large language model',
    defaultConfig: {
      model: 'gpt-3.5-turbo',
      prompt: '',
    },
  },
  {
    type: 'information_extractor',
    label: 'Information Extractor',
    category: 'ai',
    icon: FileType,
    description: 'Extract information from text in a structured format',
    defaultConfig: {
      schema: {},
      text: '',
    },
  },
  {
    type: 'qa_chain',
    label: 'Question and Answer Chain',
    category: 'ai',
    icon: Link,
    description: 'Answer questions about retrieved documents',
    defaultConfig: {
      question: '',
      documents: [],
    },
  },
  {
    type: 'sentiment_analysis',
    label: 'Sentiment Analysis',
    category: 'ai',
    icon: Scale,
    description: 'Analyze the sentiment of your text',
    defaultConfig: {
      text: '',
    },
  },
  {
    type: 'summarization_chain',
    label: 'Summarization Chain',
    category: 'ai',
    icon: Link,
    description: 'Transforms text into a concise summary',
    defaultConfig: {
      text: '',
      maxLength: 150,
    },
  },
  {
    type: 'text_classifier',
    label: 'Text Classifier',
    category: 'ai',
    icon: FileType,
    description: 'Classify your text into distinct categories',
    defaultConfig: {
      text: '',
      categories: [],
    },
  },
  {
    type: 'prompt_builder',
    label: 'Prompt Builder',
    category: 'ai',
    icon: Sparkles,
    description: 'Build AI prompts with custom tools',
    defaultConfig: {
      aiModel: 'Hybrid',
      prompt: '',
      tools: [],
    },
  },
  {
    type: 'ai_agent',
    label: 'AI Agent',
    category: 'ai',
    icon: Bot,
    description: 'Generates an action plan and executes it. Can use external tools.',
    defaultConfig: {
      model: 'gpt-4',
      goal: '',
      tools: [],
    },
  },
  {
    type: 'anthropic',
    label: 'Anthropic',
    category: 'ai',
    icon: Cpu,
    description: 'Interact with Anthropic AI models',
    defaultConfig: {
      model: 'claude-3',
      prompt: '',
      temperature: 0.7,
    },
  },
  {
    type: 'google_gemini',
    label: 'Google Gemini',
    category: 'ai',
    icon: Sparkles,
    description: 'Interact with Google Gemini AI models',
    defaultConfig: {
      model: 'gemini-pro',
      prompt: '',
      temperature: 0.7,
    },
  },
  {
    type: 'guardrails',
    label: 'Guardrails',
    category: 'ai',
    icon: Shield,
    description: 'Safeguard AI models from malicious input or prevent them from generating undesirable responses',
    defaultConfig: {
      rules: [],
      action: 'block',
    },
  },
  {
    type: 'ollama',
    label: 'Ollama',
    category: 'ai',
    icon: Cpu,
    description: 'Interact with Ollama AI models',
    defaultConfig: {
      model: 'llama2',
      prompt: '',
    },
  },
  
  // Data transformation Nodes
  // Popular subcategory
  {
    type: 'ai_transform',
    label: 'AI Transform',
    category: 'data',
    subcategory: 'popular',
    icon: Sparkles,
    description: 'Modify data based on instructions written in plain english',
    defaultConfig: {
      instructions: '',
      data: '',
    },
  },
  {
    type: 'code',
    label: 'Code',
    category: 'data',
    subcategory: 'popular',
    icon: Code,
    description: 'Run custom JavaScript or Python code',
    defaultConfig: {
      language: 'javascript',
      code: '// Your code here\\nreturn items;',
    },
    childNodes: [
      {
        type: 'code_javascript',
        label: 'Code in JavaScript',
        category: 'data',
        subcategory: 'popular',
        icon: Code,
        description: 'Run custom JavaScript code',
        defaultConfig: {
          language: 'javascript',
          code: '// Your code here\\nreturn items;',
        },
      },
      {
        type: 'code_python',
        label: 'Code in Python (Beta)',
        category: 'data',
        subcategory: 'popular',
        icon: Code,
        description: 'Run custom Python code',
        defaultConfig: {
          language: 'python',
          code: '# Your code here\\nreturn items',
        },
      },
    ],
  },
  {
    type: 'date_time',
    label: 'Date & Time',
    category: 'data',
    subcategory: 'popular',
    icon: CalendarClock,
    description: 'Manipulate date and time values',
    defaultConfig: {
      operation: 'format',
      dateValue: '',
      format: 'YYYY-MM-DD',
    },
  },
  {
    type: 'edit_fields',
    label: 'Edit Fields (Set)',
    category: 'data',
    subcategory: 'popular',
    icon: Edit3,
    description: 'Modify, add, or remove item fields',
    defaultConfig: {
      fields: [],
    },
  },
  // Add or remove items subcategory
  {
    type: 'filter',
    label: 'Filter',
    category: 'data',
    subcategory: 'add_remove',
    icon: Filter,
    description: 'Remove items matching a condition',
    defaultConfig: {
      conditions: [],
    },
  },
  {
    type: 'limit',
    label: 'Limit',
    category: 'data',
    subcategory: 'add_remove',
    icon: ArrowDown,
    description: 'Restrict the number of items',
    defaultConfig: {
      maxItems: 10,
    },
  },
  // Legacy data transformation nodes (not in subcategories)
  {
    type: 'set',
    label: 'Set Variable',
    category: 'data',
    icon: Settings,
    description: 'Assign or modify variables/data',
    defaultConfig: {
      variables: [],
    },
  },
  {
    type: 'file',
    label: 'File / PDF',
    category: 'data',
    icon: FileText,
    description: 'Parse/read files, generate documents',
    defaultConfig: {
      operation: 'read',
      fileType: 'pdf',
      path: '',
    },
  },
  
  // Flow Nodes
  {
    type: 'if',
    label: 'If',
    category: 'flow',
    icon: GitBranch,
    description: 'Conditional branching (True/False)',
    defaultConfig: {
      conditions: [],
      defaultBranch: 'continue',
    },
  },
  {
    type: 'switch',
    label: 'Switch',
    category: 'flow',
    icon: GitBranch,
    description: 'Multi-path conditional branching',
    defaultConfig: {
      cases: [],
      defaultBranch: 'continue',
    },
  },
  {
    type: 'loop',
    label: 'Loop',
    category: 'flow',
    icon: Repeat,
    description: 'Loop through data items',
    defaultConfig: {
      loopType: 'forEach',
      maxIterations: 1000,
    },
  },
  {
    type: 'split',
    label: 'Split',
    category: 'flow',
    icon: Split,
    description: 'Split data into multiple paths',
    defaultConfig: {
      splitBy: 'count',
      count: 2,
    },
  },
  {
    type: 'merge',
    label: 'Merge',
    category: 'flow',
    icon: Merge,
    description: 'Merge multiple data streams',
    defaultConfig: {
      mergeType: 'combine',
      waitForAll: true,
    },
  },
  
  // Core Nodes - Moved HTTP and Database here, added new ones
  {
    type: 'http',
    label: 'HTTP Request',
    category: 'core',
    icon: Globe,
    description: 'Call APIs or external services',
    defaultConfig: {
      method: 'GET',
      url: '',
      authentication: 'none',
      headers: {},
      body: {},
    },
  },
  {
    type: 'database',
    label: 'Database',
    category: 'core',
    icon: Database,
    description: 'Read/write database operations',
    defaultConfig: {
      operation: 'select',
      connectionType: 'postgresql',
      query: '',
    },
  },
  {
    type: 'execute_workflow',
    label: 'Execute Workflow',
    category: 'core',
    icon: WorkflowIcon,
    description: 'Call other workflows',
    defaultConfig: {
      workflowId: '',
      waitForCompletion: true,
      passData: true,
    },
  },
  {
    type: 'webhook',
    label: 'Webhook',
    category: 'core',
    icon: Globe,
    description: 'Set up webhooks to receive data',
    defaultConfig: {
      url: '',
      method: 'POST',
    },
  },
  {
    type: 'respond_webhook',
    label: 'Respond to Webhook',
    category: 'core',
    icon: ArrowRight,
    description: 'Send a response to an incoming webhook',
    defaultConfig: {
      statusCode: 200,
      body: {},
    },
  },
  {
    type: 'wait',
    label: 'Wait / Delay',
    category: 'core',
    icon: Clock,
    description: 'Pause workflow execution',
    defaultConfig: {
      waitType: 'time',
      duration: 1000,
      unit: 'seconds',
    },
  },
  {
    type: 'approval',
    label: 'Wait for Approval',
    category: 'core',
    icon: User,
    description: 'Wait for approval or human input before continuing',
    defaultConfig: {
      approvers: [],
      message: 'Please approve this workflow step',
    },
  },
  {
    type: 'error',
    label: 'Error / Stop',
    category: 'core',
    icon: AlertCircle,
    description: 'Handle workflow failures',
    defaultConfig: {
      action: 'stop',
      message: 'Workflow stopped',
      continueOnError: false,
    },
  },
  {
    type: 'ftp',
    label: 'FTP',
    category: 'core',
    icon: HardDrive,
    description: 'Upload/download files via FTP',
    defaultConfig: {
      operation: 'upload',
      host: '',
      path: '',
    },
  },
  
  // Human in the loop Nodes - Removed nodes that moved to Core
];

export function getNodesByCategory(category: string): NodeTemplate[] {
  return nodeTemplates.filter(node => node.category === category);
}

export function searchNodes(query: string): NodeTemplate[] {
  const lowerQuery = query.toLowerCase();
  return nodeTemplates.filter(
    node =>
      node.label.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery) ||
      node.category.toLowerCase().includes(lowerQuery)
  );
}