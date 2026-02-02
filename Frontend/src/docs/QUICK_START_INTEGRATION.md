# 🚀 Quick Start Integration Guide

## Get Your Workflow Builder Live in 30 Minutes!

### Step 1: Setup DnD Provider (5 min)

```typescript
// app/layout.tsx
import { DndContextProvider } from '@/features/workflow-builder';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0E0E1F]">
        <DndContextProvider>
          {children}
        </DndContextProvider>
      </body>
    </html>
  );
}
```

---

### Step 2: Create Workflow Page (5 min)

```typescript
// app/workflows/page.tsx
'use client';

import { WorkflowBuilderV2 } from '@/features/workflow-builder';

export default function WorkflowsPage() {
  return (
    <div className="h-screen">
      <WorkflowBuilderV2 />
    </div>
  );
}
```

---

### Step 3: Add Custom Drag Layer (2 min)

```typescript
// app/workflows/page.tsx (updated)
'use client';

import { 
  WorkflowBuilderV2,
  CustomDragLayer,
} from '@/features/workflow-builder';

export default function WorkflowsPage() {
  return (
    <div className="h-screen">
      <WorkflowBuilderV2 />
      <CustomDragLayer />
    </div>
  );
}
```

---

### Step 4: Test It! (5 min)

```bash
npm run dev
```

Visit: `http://localhost:3000/workflows`

**Try these:**
1. ✅ Click "Add Trigger" → Select a trigger
2. ✅ Click "Add Node" → Select a node
3. ✅ Click "Add Form Field" → Add some fields
4. ✅ Drag fields to reorder them
5. ✅ Click "Execute Workflow"
6. ✅ Watch the console for logs
7. ✅ Check execution history

---

### Step 5: Add Persistence (10 min)

#### A. Connect to Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

#### B. Save Workflow Function

```typescript
// app/workflows/page.tsx
import { supabase } from '@/lib/supabase';
import { useWorkflowStore } from '@/features/workflow-builder';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const workflowData = useWorkflowStore();

  const saveWorkflow = async () => {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name: 'My Workflow',
        data: workflowData,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

    if (error) {
      toast.error('Failed to save workflow');
      console.error(error);
    } else {
      toast.success('Workflow saved successfully!');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Save Button */}
      <div className="bg-[#1A1A2E] border-b border-[#2A2A3E] p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-white text-2xl font-bold">Workflow Builder</h1>
          <Button 
            onClick={saveWorkflow}
            className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF]"
          >
            Save Workflow
          </Button>
        </div>
      </div>

      {/* Workflow Builder */}
      <div className="flex-1">
        <WorkflowBuilderV2 />
        <CustomDragLayer />
      </div>
    </div>
  );
}
```

#### C. Create Database Table

```sql
-- Run in Supabase SQL Editor
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can manage their own workflows"
  ON workflows
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
```

---

### Step 6: Load Saved Workflows (5 min)

```typescript
// app/workflows/page.tsx (complete version)
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  WorkflowBuilderV2,
  CustomDragLayer,
  useWorkflowStore,
} from '@/features/workflow-builder';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const { setWorkflowData } = useWorkflowStore();
  const [workflows, setWorkflows] = useState([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null);

  // Load user's workflows
  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWorkflows(data);
    }
  };

  const loadWorkflow = (workflow) => {
    setWorkflowData(workflow.data);
    setCurrentWorkflowId(workflow.id);
    toast.success(`Loaded: ${workflow.name}`);
  };

  const saveWorkflow = async () => {
    const workflowData = useWorkflowStore.getState();
    
    if (currentWorkflowId) {
      // Update existing
      const { error } = await supabase
        .from('workflows')
        .update({ data: workflowData, updated_at: new Date() })
        .eq('id', currentWorkflowId);

      if (!error) {
        toast.success('Workflow updated!');
        loadWorkflows();
      }
    } else {
      // Create new
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name: 'New Workflow',
          data: workflowData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (!error && data) {
        setCurrentWorkflowId(data.id);
        toast.success('Workflow saved!');
        loadWorkflows();
      }
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar - Saved Workflows */}
      <div className="w-64 bg-[#1A1A2E] border-r border-[#2A2A3E] p-4 overflow-y-auto">
        <h2 className="text-white font-bold mb-4">My Workflows</h2>
        
        <Button 
          onClick={() => {
            setWorkflowData({});
            setCurrentWorkflowId(null);
          }}
          className="w-full mb-4"
        >
          + New Workflow
        </Button>

        <div className="space-y-2">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() => loadWorkflow(wf)}
              className={`w-full text-left p-3 rounded ${
                currentWorkflowId === wf.id
                  ? 'bg-[#00C6FF]/20 border border-[#00C6FF]'
                  : 'bg-[#2A2A3E] hover:bg-[#3A3A4E]'
              } text-white text-sm transition-colors`}
            >
              <div className="font-medium">{wf.name}</div>
              <div className="text-xs text-gray-400">
                {new Date(wf.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#1A1A2E] border-b border-[#2A2A3E] p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl font-bold">Workflow Builder</h1>
            <Button 
              onClick={saveWorkflow}
              className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF]"
            >
              {currentWorkflowId ? 'Update' : 'Save'} Workflow
            </Button>
          </div>
        </div>

        {/* Workflow Builder */}
        <div className="flex-1">
          <WorkflowBuilderV2 />
          <CustomDragLayer />
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ You're Done! 🎉

Your workflow builder is now:
- ✅ Integrated into your app
- ✅ Saving to Supabase
- ✅ Loading saved workflows
- ✅ Full drag & drop working
- ✅ Execution engine working
- ✅ Variable system ready

---

## 🚀 Next Steps

### 1. Add Auto-Save (Optional)

```typescript
// hooks/useAutoSave.ts
import { useEffect } from 'react';
import { useWorkflowStore } from '@/features/workflow-builder';

export function useAutoSave(workflowId: string | null) {
  const workflow = useWorkflowStore();

  useEffect(() => {
    if (!workflowId) return;

    const timer = setTimeout(async () => {
      await supabase
        .from('workflows')
        .update({ data: workflow })
        .eq('id', workflowId);
      
      console.log('Auto-saved!');
    }, 3000); // Save after 3s of inactivity

    return () => clearTimeout(timer);
  }, [workflow, workflowId]);
}

// Use in page
useAutoSave(currentWorkflowId);
```

### 2. Add Toasts

```bash
npm install sonner
```

```typescript
// app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
```

### 3. Deploy!

```bash
# Deploy to Vercel
vercel --prod

# Or push to GitHub and connect to Vercel
git add .
git commit -m "Add workflow builder"
git push origin main
```

---

## 🎯 Production Checklist

Before going live:
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Add error boundaries
- [ ] Set up monitoring (Sentry)
- [ ] Add user authentication
- [ ] Configure environment variables
- [ ] Test database backups
- [ ] Write user documentation

---

## 💡 Pro Tips

### Tip 1: Name Your Workflows
Add a rename feature:
```typescript
const [name, setName] = useState(workflow.name);

const updateName = async (newName) => {
  await supabase
    .from('workflows')
    .update({ name: newName })
    .eq('id', workflowId);
  
  setName(newName);
};
```

### Tip 2: Add Templates
Create pre-built workflows:
```typescript
const templates = [
  {
    name: 'Contact Form',
    data: { /* pre-configured workflow */ },
  },
  {
    name: 'Order Processing',
    data: { /* pre-configured workflow */ },
  },
];
```

### Tip 3: Export/Import
Let users share workflows:
```typescript
const exportWorkflow = () => {
  const json = JSON.stringify(workflowData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workflow.json';
  a.click();
};
```

---

## 🎉 Congratulations!

You now have a fully working, production-ready workflow builder integrated into your app!

**Start building amazing workflows!** 🚀✨
