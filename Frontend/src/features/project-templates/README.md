# Project Templates Feature

Complete industry-specific project templates system that allows users to instantly create fully configured projects with boards, tasks, and attached workflows.

## Overview

The Project Templates feature provides pre-built project templates for different industries and use cases. Each template includes:
- **Multiple Boards**: Pre-configured boards with tasks
- **Tasks with Workflows**: Tasks can have workflows attached
- **API Configuration**: Wizard-guided setup for required integrations
- **Smart Variables**: Personalize templates with company info
- **Complete Setup**: Everything ready to use in minutes

## Available Templates

### 1. **E-commerce Automation Suite** 🛒
- **Industry**: E-commerce, Retail, Online Business
- **Difficulty**: Intermediate
- **Setup Time**: ~10 minutes
- **Boards**: 
  - Order Processing (4 tasks)
  - Customer Management (3 tasks)
  - Analytics & Reporting (2 tasks)
- **Key Features**:
  - Order notification automation
  - Customer email sequences
  - Inventory management
  - Daily sales reports
- **Required Integrations**: Stripe, SendGrid, Slack

### 2. **Marketing Campaign Manager** 📢
- **Industry**: Marketing, Agency, SaaS
- **Difficulty**: Beginner
- **Setup Time**: ~8 minutes
- **Boards**:
  - Email Campaigns (3 tasks)
  - Social Media (3 tasks)
  - Content Creation (2 tasks)
  - Analytics & Reports (2 tasks)
- **Key Features**:
  - Email campaign automation
  - Social media scheduling
  - AI content generation
  - Campaign analytics
- **Required Integrations**: SendGrid, Twitter, LinkedIn, OpenAI

### 3. **Sales Pipeline Automation** 💼
- **Industry**: Sales, B2B, SaaS
- **Difficulty**: Intermediate
- **Setup Time**: ~12 minutes
- **Boards**:
  - Lead Management (4 tasks)
  - Follow-up Sequences (3 tasks)
  - CRM Integration (3 tasks)
  - Sales Analytics (2 tasks)
- **Key Features**:
  - Lead capture & scoring
  - Automated follow-ups
  - CRM synchronization
  - Pipeline reporting
- **Required Integrations**: Salesforce/HubSpot, SendGrid, Slack

### 4. **Customer Support Hub** 🎧
- **Industry**: Customer Service, SaaS, Support
- **Difficulty**: Beginner
- **Setup Time**: ~7 minutes
- **Boards**:
  - Ticket Management (4 tasks)
  - Knowledge Base (2 tasks)
  - Customer Feedback (3 tasks)
  - Team Performance (2 tasks)
- **Key Features**:
  - Intelligent ticket routing
  - AI chatbot deployment
  - CSAT/NPS tracking
  - SLA monitoring
- **Required Integrations**: Zendesk/Intercom, SendGrid, OpenAI

### 5. **Employee Onboarding System** 👔
- **Industry**: HR, Human Resources, People Ops
- **Difficulty**: Beginner
- **Setup Time**: ~9 minutes
- **Boards**:
  - Pre-boarding (4 tasks)
  - First Day (3 tasks)
  - First Week (3 tasks)
  - First Month (3 tasks)
- **Key Features**:
  - Document collection automation
  - IT provisioning
  - Training assignment
  - 30-day feedback surveys
- **Required Integrations**: Google Workspace, Slack, DocuSign, SendGrid

### 6. **Content Production Pipeline** ✍️
- **Industry**: Content, Media, Publishing
- **Difficulty**: Intermediate
- **Setup Time**: ~10 minutes
- **Boards**:
  - Content Ideation (3 tasks)
  - Content Creation (3 tasks)
  - Review & Approval (3 tasks)
  - Publishing & Distribution (4 tasks)
- **Key Features**:
  - AI content generation
  - Editorial workflow
  - Multi-platform publishing
  - Performance tracking
- **Required Integrations**: WordPress/CMS, OpenAI, Twitter, SendGrid

## Architecture

### Components

```
/features/project-templates/
├── components/
│   ├── ProjectTemplateGallery.tsx    # Main gallery UI
│   ├── ProjectTemplateCard.tsx       # Template card display
│   ├── TemplatePreview.tsx           # Detailed template preview
│   └── ConfigurationWizard.tsx       # Multi-step setup wizard
├── templates/
│   ├── ecommerce-automation.ts       # E-commerce template
│   ├── marketing-campaigns.ts        # Marketing template
│   ├── sales-pipeline.ts             # Sales template
│   ├── customer-support.ts           # Support template
│   ├── hr-onboarding.ts              # HR template
│   ├── content-production.ts         # Content template
│   └── index.ts                      # Template registry
├── types/
│   └── projectTemplate.types.ts      # Type definitions
├── utils/
│   └── projectTemplateManager.ts     # Template management
└── index.ts                          # Public API
```

### Type System

#### ProjectTemplate
```typescript
interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  category: ProjectTemplateCategory;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string;
  boards: BoardTemplate[];
  workflows: WorkflowTemplate[];
  requiredIntegrations: string[];
  requiredApiKeys: ApiKeyConfig[];
  tags: string[];
  useCases: string[];
  benefits: string[];
  featured?: boolean;
  usageCount?: number;
}
```

#### BoardTemplate
```typescript
interface BoardTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tasks: TaskTemplate[];
}
```

#### TaskTemplate
```typescript
interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  assignee?: string;
  dueDate?: string; // Relative date like "+2d"
  workflowId?: string; // Attached workflow reference
}
```

## Usage

### 1. Opening the Template Gallery

Click the **"New from Template"** button in the Projects page header (gradient blue-violet button with sparkles icon).

### 2. Browsing Templates

- **Categories**: Filter by E-commerce, Marketing, Sales, Support, HR, Content
- **Search**: Search by name, description, tags, or industry
- **Featured**: View most popular/recommended templates first

### 3. Template Preview

Click any template card to see:
- Detailed overview with stats
- Key benefits
- All included boards and tasks
- Required integrations
- Number of teams using it

### 4. Configuration Wizard

The wizard guides you through 4 steps:

#### Step 1: Overview
- Review template details
- See boards, tasks, workflows count
- View key benefits

#### Step 2: API Keys
- Enter required API keys
- Toggle visibility for security
- Validation before proceeding

#### Step 3: Configuration
- Personalize with company name
- Add email address
- Custom fields (template-specific)

#### Step 4: Review
- Final confirmation
- Summary of configuration
- Create project

### 5. Project Creation

Upon completion:
- Project is created with configured name
- All boards are set up
- Tasks are created with:
  - Proper status assignments
  - Due dates (relative dates converted)
  - Tags/labels
  - Attached workflows (if applicable)
- Success notification with summary

## API Reference

### Template Registry

```typescript
// Get all templates
import { PROJECT_TEMPLATES } from './features/project-templates';

// Get by category
import { getTemplatesByCategory } from './features/project-templates';
const ecommerceTemplates = getTemplatesByCategory('ecommerce');

// Search templates
import { searchTemplates } from './features/project-templates';
const results = searchTemplates('automation');

// Get featured
import { getFeaturedTemplates } from './features/project-templates';
const featured = getFeaturedTemplates();
```

### Template Manager

```typescript
import { 
  createProjectFromTemplate,
  getTasksForBoard,
  validateApiKeys,
  getTemplateStats
} from './features/project-templates';

// Create project from template
const projectData = createProjectFromTemplate(template, config, userId);

// Get tasks for board
const tasks = getTasksForBoard(template, boardId, actualBoardId, projectId, config, userId);

// Validate API keys
const { valid, errors } = await validateApiKeys(template, apiKeys);

// Get template statistics
const stats = getTemplateStats(template);
```

## Features

### Smart Date Handling
Relative dates in templates are automatically converted:
- `+1d` → 1 day from now
- `+2w` → 2 weeks from now
- `+1m` → 1 month from now

### Variable Substitution
Templates support variables:
- `{{companyName}}` → Your company name
- `{{email}}` → Your email
- Custom fields defined in template

### Workflow Integration
Tasks can reference workflow templates:
- `workflowId` links to workflow template
- Workflows are pre-configured and ready to use
- Users can customize after creation

### Progress Tracking
The wizard shows clear progress:
- Visual stepper with icons
- Completion indicators
- Back/Next navigation
- Validation at each step

## Extensibility

### Adding New Templates

1. Create template file in `/features/project-templates/templates/`
2. Follow the `ProjectTemplate` interface
3. Add to `index.ts` registry
4. Template automatically appears in gallery

Example:
```typescript
export const myTemplate: ProjectTemplate = {
  id: 'my-template-v1',
  name: 'My Awesome Template',
  description: 'Does amazing things',
  industry: ['Technology'],
  category: 'development',
  // ... rest of config
};
```

### Custom Categories

Add new categories in `projectTemplate.types.ts`:
```typescript
export type ProjectTemplateCategory = 
  | 'ecommerce'
  | 'marketing'
  | 'your-new-category'; // Add here
```

Then add category info in `templates/index.ts`:
```typescript
export const CATEGORY_INFO = {
  'your-new-category': {
    label: 'Your Category',
    description: 'Description here',
    icon: '🎯',
  },
};
```

## Benefits

### For Users
- ⚡ **Fast Setup**: Get started in minutes, not hours
- 🎯 **Best Practices**: Templates follow industry standards
- 🔧 **Customizable**: Easy to modify after creation
- 📊 **Proven**: Based on successful project patterns
- 🤖 **Automation Ready**: Workflows pre-configured

### For Teams
- 📈 **Consistency**: Standardize project structure
- 👥 **Onboarding**: New team members start faster
- 💡 **Knowledge**: Embedded best practices
- 🔄 **Repeatability**: Replicate successful projects
- 📋 **Compliance**: Ensure nothing is forgotten

## Testing

To test the feature:

1. **Open Gallery**:
   - Go to Projects page
   - Click "New from Template" button

2. **Browse Templates**:
   - Try different categories
   - Search for "automation"
   - Click featured templates

3. **Preview Template**:
   - Click E-commerce template
   - Review all boards and tasks
   - Click "Use This Template"

4. **Configuration Wizard**:
   - Step through all 4 steps
   - Enter test API keys
   - Add company info
   - Complete wizard

5. **Verify Creation**:
   - Check new project appears
   - Open boards and verify tasks
   - Confirm all data is correct

## Future Enhancements

- [ ] Export custom projects as templates
- [ ] Share templates with team
- [ ] Template marketplace
- [ ] Version control for templates
- [ ] Template analytics/metrics
- [ ] Workflow template integration
- [ ] AI-suggested templates based on company
- [ ] Template rating/reviews
- [ ] Template duplication
- [ ] Multi-language templates

## Support

For issues or questions:
1. Check this README for usage guidance
2. Review template definitions for structure
3. Check console for error messages
4. Verify API keys are correct
5. Ensure all required integrations are connected
