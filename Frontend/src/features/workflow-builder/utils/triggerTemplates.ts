import { 
  Webhook, Calendar, FileText, Mail, Database, Globe, Zap, Clock, ArrowRight
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface TriggerCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  hasMoreOptions?: boolean; // For "Action by tools"
}

export const triggerCategories: TriggerCategory[] = [
  {
    id: 'form',
    label: 'When a form is submitted',
    description: 'Start the flow when someone fills your form',
    icon: FileText,
  },
  {
    id: 'webhook',
    label: 'Catch a webhook',
    description: 'Start the flow from an HTTP POST request',
    icon: Webhook,
  },
  {
    id: 'schedule',
    label: 'On a schedule',
    description: 'Run the flow at specific times or intervals',
    icon: Clock,
  },
  {
    id: 'manual',
    label: 'Manually',
    description: 'Run the flow whenever you want by clicking a button',
    icon: Zap,
  },
  {
    id: 'action_by_tools',
    label: 'Action by tools',
    description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
    icon: Globe,
    hasMoreOptions: true,
  },
];

export interface TriggerTemplate {
  type: string;
  label: string;
  icon: LucideIcon;
  description: string;
  defaultConfig: Record<string, any>;
  category: string; // Links to triggerCategories
  hasMoreOptions?: boolean; // For showing → arrow
}

export const triggerTemplates: TriggerTemplate[] = [
  {
    type: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    description: 'Trigger via HTTP webhook',
    category: 'webhook',
    defaultConfig: {
      method: 'POST',
      authentication: 'none',
    },
  },
  {
    type: 'schedule',
    label: 'Schedule',
    icon: Clock,
    description: 'Run on a schedule (cron)',
    category: 'schedule',
    defaultConfig: {
      schedule: '0 0 * * *',
      timezone: 'UTC',
    },
  },
  {
    type: 'email_received',
    label: 'Email Received',
    icon: Mail,
    description: 'Trigger when an email is received',
    category: 'action_by_tools',
    defaultConfig: {
      mailbox: 'inbox',
      filters: {},
    },
  },
  {
    type: 'database_change',
    label: 'Database Change',
    icon: Database,
    description: 'Trigger on database insert/update/delete',
    category: 'action_by_tools',
    defaultConfig: {
      table: '',
      operation: 'insert',
    },
  },
  {
    type: 'api_call',
    label: 'API Call',
    icon: Globe,
    description: 'Trigger via API endpoint',
    category: 'webhook',
    defaultConfig: {
      endpoint: '',
      authentication: 'api_key',
    },
  },
  {
    type: 'manual',
    label: 'Manual Trigger',
    icon: Zap,
    description: 'Start workflow manually',
    category: 'manual',
    defaultConfig: {},
  },
];

export function searchTriggers(query: string): TriggerTemplate[] {
  const lowerQuery = query.toLowerCase();
  return triggerTemplates.filter(
    trigger =>
      trigger.label.toLowerCase().includes(lowerQuery) ||
      trigger.description.toLowerCase().includes(lowerQuery)
  );
}