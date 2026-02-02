# Workflow Import/Export Guide

## Overview
The Templates dropdown in the workflow builder now provides two key features:
- **Import**: Browse pre-built templates or upload previously exported workflows
- **Export**: Download your current workflow as a JSON file for backup or sharing

## How to Use

### Exporting a Workflow

1. Open the workflow builder
2. Build your workflow with triggers, nodes, and form fields
3. Click the **Templates** dropdown button (with ✨ icon) in the top bar
4. Select **Export** from the dropdown menu
5. Your workflow will be downloaded as a JSON file with the format: `workflow_name_timestamp.json`

**What's included in the export:**
- Workflow name and description
- All triggers and trigger logic
- All containers and nodes
- All form fields
- Export metadata (version, timestamp, workflow ID)

### Importing a Workflow

#### Method 1: From Template Library
1. Click the **Templates** dropdown button in the top bar
2. Select **Import** from the dropdown menu
3. The Template Library modal will open
4. Browse the 15 pre-built templates organized by category
5. Click on any template card to preview it
6. Click **Install Template** to load it into your workflow

#### Method 2: Upload a Previously Exported File
1. Click the **Templates** dropdown button in the top bar
2. Select **Import** from the dropdown menu
3. In the Template Library modal, click the **Import JSON** button in the header
4. Select a previously exported workflow JSON file from your computer
5. The workflow will be automatically loaded into the builder

**Supported file formats:**
- ✅ Exported workflow files (created via Export function)
- ✅ Full template files (with complete metadata)
- ❌ Invalid or corrupted JSON files will show an error

## File Format

### Exported Workflow Format
```json
{
  "version": "1.0",
  "name": "My Workflow",
  "description": "Workflow description",
  "triggers": [...],
  "triggerLogic": [...],
  "containers": [...],
  "formFields": [...],
  "exportedAt": "2025-11-22T...",
  "workflowId": "workflow-123" or null
}
```

### Template Format
```json
{
  "id": "template-id",
  "name": "Template Name",
  "description": "Template description",
  "category": "automation",
  "icon": "Zap",
  "tags": ["automation", "email"],
  "difficulty": "beginner",
  "estimatedTime": "5 minutes",
  "useCases": ["..."],
  "featured": true,
  "popularity": 95,
  "author": "Flowversal",
  "createdAt": "2025-01-15",
  "updatedAt": "2025-01-15",
  "workflowData": {
    "workflowName": "...",
    "workflowDescription": "...",
    "triggers": [...],
    "triggerLogic": [...],
    "containers": [...],
    "formFields": [...]
  }
}
```

## Features

### Smart Format Detection
The import system automatically detects whether you're uploading:
- An exported workflow (simple format)
- A full template (with metadata)

Both formats are supported and will work seamlessly!

### Automatic Icon Restoration
When importing a workflow:
- Node icons are automatically restored from the NodeRegistry
- Trigger icons are automatically restored from the TriggerRegistry
- Missing types will be logged as warnings in the console

### Success Notifications
- Export: Console log confirmation
- Import: Success notification with template name
- Errors: Detailed error messages for troubleshooting

## Use Cases

### Backup Your Work
- Export workflows before making major changes
- Keep versions of your workflows for rollback
- Archive completed workflows

### Share Workflows
- Export a workflow and share the JSON file with team members
- Team members can import and customize the workflow
- Great for collaboration and knowledge sharing

### Template Creation
- Build a workflow once, export it
- Share with the community
- Reuse across multiple projects

## Troubleshooting

### "Invalid file format" error
- Make sure you're uploading a valid JSON file
- Check that the file contains either a `containers` array (exported workflow) or `workflowData` object (template)

### "Missing workflowData" error
- The template file might be corrupted
- Try re-exporting the workflow

### Nodes/Triggers missing after import
- Check the console for warnings about missing types
- Ensure all required node types are registered in NodeRegistry
- Ensure all required trigger types are registered in TriggerRegistry

## Technical Details

### Components Involved
- `TemplatesDropdown`: Main dropdown UI component
- `TemplateLibrary`: Modal for browsing and importing
- `templateImportExport.ts`: Import/export utilities
- `workflowStore.ts`: State management for workflow data

### State Management
- Import operations use `workflowStore.loadWorkflow()`
- Export operations read from `useWorkflowStore()` state
- Template Library state managed via `useTemplateStore()`

### Security
- All file operations happen client-side (no server upload)
- JSON parsing includes error handling
- File validation before loading into state
