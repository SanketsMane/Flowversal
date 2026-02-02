# 🚀 Phase 4 Part 3 - Usage Example

## Quick Start Guide - Variable System

### 1. Setup Variable Store

```typescript
import { useVariables } from '@/features/workflow-builder';

function MyComponent() {
  const {
    variables,
    context,
    addVariable,
    setContext,
  } = useVariables();

  // Initialize from workflow
  useEffect(() => {
    // Add some variables
    addVariable({
      id: 'user-email',
      name: 'User Email',
      path: 'user.email',
      type: 'string',
      scope: 'workflow',
      category: 'user',
      description: 'Current user email address',
      value: 'john@example.com',
    });
  }, []);

  return <div>Variables ready!</div>;
}
```

---

### 2. Variable Input with Auto-Suggest

```typescript
import { VariableInput } from '@/features/workflow-builder';

export function MyForm() {
  const [emailTemplate, setEmailTemplate] = useState('');

  return (
    <div className="space-y-4">
      <label>Email Template</label>
      
      {/* Input with variable auto-suggest */}
      <VariableInput
        value={emailTemplate}
        onChange={setEmailTemplate}
        placeholder="Hello {{user.name}}, welcome!"
      />

      {/* Preview resolved value */}
      <div className="text-sm text-gray-500">
        Preview: {emailTemplate}
      </div>
    </div>
  );
}
```

**Try typing:**
- `Hello {{` - Auto-suggest appears!
- Select variable with arrow keys
- Press Enter or Tab to insert
- Result: `Hello {{user.name}}`

---

### 3. Variable Picker Modal

```typescript
import { useState } from 'react';
import { VariablePicker, Button } from '@/features/workflow-builder';

export function EmailComposer() {
  const [subject, setSubject] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="flex-1"
        />
        
        <Button onClick={() => setShowPicker(true)}>
          Insert Variable
        </Button>
      </div>

      {/* Variable Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-[600px]">
            <VariablePicker
              onSelect={(event) => {
                setSubject(subject + ' ' + event.reference);
                setShowPicker(false);
              }}
              onClose={() => setShowPicker(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 4. Variable Preview Panel

```typescript
import { VariablePreview } from '@/features/workflow-builder';

export function DebugPanel() {
  return (
    <div className="grid grid-cols-2 gap-4 h-screen">
      {/* Your workflow UI */}
      <div>
        <h2>Workflow Builder</h2>
        {/* ... */}
      </div>

      {/* Variable Preview Panel */}
      <div>
        <VariablePreview />
      </div>
    </div>
  );
}
```

---

### 5. Parse and Resolve Variables

```typescript
import {
  parseVariableReferences,
  resolveVariablesInString,
  useVariables,
} from '@/features/workflow-builder';

export function VariableProcessor() {
  const { context } = useVariables();

  const template = 'Hello {{user.name}}, your order #{{order.id}} is ready!';

  // Parse references
  const references = parseVariableReferences(template);
  console.log('Found variables:', references);
  // Output: [{ path: 'user.name', ... }, { path: 'order.id', ... }]

  // Resolve to actual values
  const resolved = resolveVariablesInString(template, context);
  console.log('Resolved:', resolved);
  // Output: "Hello John Doe, your order #12345 is ready!"

  return (
    <div>
      <div>Template: {template}</div>
      <div>Resolved: {resolved}</div>
    </div>
  );
}
```

---

### 6. Use Transformations

```typescript
import {
  buildVariableReference,
  resolveVariablesInString,
  useVariables,
} from '@/features/workflow-builder';

export function TransformationExample() {
  const { context, setVariableValue } = useVariables();

  // Set some test data
  useEffect(() => {
    setVariableValue('user.name', 'john doe');
    setVariableValue('user.email', '  JOHN@EXAMPLE.COM  ');
    setVariableValue('items', ['apple', 'banana', 'orange']);
  }, []);

  const examples = [
    // String transformations
    { input: '{{user.name|uppercase}}', label: 'Uppercase' },
    { input: '{{user.name|capitalize}}', label: 'Capitalize' },
    { input: '{{user.email|trim|lowercase}}', label: 'Trim + Lowercase' },
    
    // Array transformations
    { input: '{{items|join:", "}}', label: 'Join Array' },
    { input: '{{items|first}}', label: 'First Element' },
    { input: '{{items|length}}', label: 'Array Length' },
  ];

  return (
    <div className="space-y-2">
      {examples.map((ex, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-48 font-mono text-sm">{ex.input}</div>
          <div className="text-gray-500">→</div>
          <div className="font-medium">
            {resolveVariablesInString(ex.input, context)}
          </div>
          <div className="text-gray-400 text-sm">({ex.label})</div>
        </div>
      ))}
    </div>
  );
}
```

**Output:**
```
{{user.name|uppercase}}        → JOHN DOE          (Uppercase)
{{user.name|capitalize}}       → John Doe          (Capitalize)
{{user.email|trim|lowercase}}  → john@example.com  (Trim + Lowercase)
{{items|join:", "}}            → apple, banana, orange  (Join Array)
{{items|first}}                → apple             (First Element)
{{items|length}}               → 3                 (Array Length)
```

---

### 7. Transformation Picker

```typescript
import { useState } from 'react';
import { 
  TransformationPicker,
  buildVariableReference,
} from '@/features/workflow-builder';

export function FieldWithTransformations() {
  const [selectedVar, setSelectedVar] = useState('user.name');
  const [transformations, setTransformations] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const fullReference = buildVariableReference(selectedVar, transformations);

  return (
    <div>
      {/* Current reference */}
      <div className="mb-4">
        <code className="bg-gray-800 text-green-400 px-3 py-2 rounded">
          {fullReference}
        </code>
      </div>

      {/* Transformations */}
      <div className="flex gap-2 flex-wrap mb-4">
        {transformations.map((t, i) => (
          <div key={i} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
            {t}
            <button
              onClick={() => {
                setTransformations(transformations.filter((_, idx) => idx !== i));
              }}
              className="ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add transformation button */}
      <button
        onClick={() => setShowPicker(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Transformation
      </button>

      {/* Transformation picker */}
      {showPicker && (
        <TransformationPicker
          selectedTransformations={transformations}
          onSelect={(t) => {
            setTransformations([...transformations, t.id]);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
```

---

### 8. Complete Example: Email Template Builder

```typescript
import { useState, useEffect } from 'react';
import {
  VariableInput,
  VariablePicker,
  VariablePreview,
  useVariables,
  resolveVariablesInString,
} from '@/features/workflow-builder';

export function EmailTemplateBuilder() {
  const { context, addVariable, setContext } = useVariables();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPicker, setShowPicker] = useState<'subject' | 'body' | null>(null);

  // Initialize sample data
  useEffect(() => {
    // Add variables
    addVariable({
      id: 'user-name',
      name: 'User Name',
      path: 'user.name',
      type: 'string',
      scope: 'workflow',
      category: 'user',
      value: 'John Doe',
    });

    addVariable({
      id: 'order-id',
      name: 'Order ID',
      path: 'order.id',
      type: 'string',
      scope: 'workflow',
      category: 'custom',
      value: '12345',
    });

    // Set context with sample data
    setContext({
      variables: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        order: {
          id: '12345',
          total: 99.99,
          items: ['Product A', 'Product B'],
        },
      },
      stepOutputs: {},
      globalVariables: {},
    });
  }, []);

  // Preview resolved values
  const resolvedSubject = resolveVariablesInString(subject, context);
  const resolvedBody = resolveVariablesInString(body, context);

  return (
    <div className="grid grid-cols-2 gap-4 h-screen p-4">
      {/* Left: Editor */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Email Template</h1>

        {/* Subject */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Subject Line
          </label>
          <div className="flex gap-2">
            <VariableInput
              value={subject}
              onChange={setSubject}
              placeholder="Order {{order.id}} Confirmation"
              className="flex-1"
            />
            <button
              onClick={() => setShowPicker('subject')}
              className="px-4 py-2 bg-[#00C6FF] text-white rounded"
            >
              + Var
            </button>
          </div>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Email Body
          </label>
          <div className="flex gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hello {{user.name}}, ..."
              rows={10}
              className="flex-1 bg-[#1A1A2E] text-white p-3 rounded border border-[#2A2A3E]"
            />
            <button
              onClick={() => setShowPicker('body')}
              className="px-4 py-2 bg-[#00C6FF] text-white rounded h-fit"
            >
              + Var
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#1A1A2E] p-4 rounded border border-[#2A2A3E]">
          <h3 className="text-white font-medium mb-3">Preview</h3>
          
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-400">Subject:</div>
              <div className="text-white">{resolvedSubject || '(empty)'}</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-400">Body:</div>
              <div className="text-white whitespace-pre-wrap">
                {resolvedBody || '(empty)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Variable Preview */}
      <div>
        <VariablePreview />
      </div>

      {/* Variable Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-[600px]">
            <VariablePicker
              onSelect={(event) => {
                if (showPicker === 'subject') {
                  setSubject(subject + event.reference);
                } else {
                  setBody(body + event.reference);
                }
                setShowPicker(null);
              }}
              onClose={() => setShowPicker(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 9. Custom Transformations

```typescript
import { 
  registerTransformation,
  VariableTransformation,
} from '@/features/workflow-builder';

// Register custom transformation
registerTransformation({
  id: 'currency',
  name: 'Currency',
  description: 'Format number as currency',
  category: 'Number',
  example: '{{price|currency}} → $99.99',
  apply: (value: any) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  },
});

// Use it
const template = 'Total: {{order.total|currency}}';
// Result: "Total: $99.99"
```

---

### 10. Initialize from Execution Context

```typescript
import { useVariables, useExecution } from '@/features/workflow-builder';

export function WorkflowWithVariables() {
  const { initializeFromExecution } = useVariables();
  const { currentExecution } = useExecution();

  // Auto-sync variables from execution
  useEffect(() => {
    if (currentExecution) {
      initializeFromExecution(currentExecution);
    }
  }, [currentExecution]);

  // Now all step outputs are available as variables!
  // {{step_1.output}}, {{step_2.result}}, etc.

  return <div>Variables synced with execution!</div>;
}
```

---

## 📚 All Available Transformations

### String (6)
- `uppercase` - Convert to UPPERCASE
- `lowercase` - Convert to lowercase  
- `capitalize` - Capitalize Each Word
- `trim` - Remove whitespace
- `truncate:50` - Truncate to length
- `urlEncode` - URL encode string

### Number (2)
- `round:2` - Round to 2 decimals
- `abs` - Absolute value

### Array (4)
- `join:", "` - Join with separator
- `first` - Get first element
- `last` - Get last element
- `length` - Get array length

### Date (1)
- `dateFormat:MM/DD/YYYY` - Format date

### Conversion (3)
- `json` - Convert to JSON string
- `number` - Convert to number
- `string` - Convert to string

### Utility (3)
- `default:"N/A"` - Default if empty
- `base64` - Encode to base64

**Total: 17+ transformations!**

---

## 💡 Tips & Best Practices

### 1. Variable Naming
```typescript
// ✅ Good - Clear hierarchy
{{trigger.formData.email}}
{{user.profile.name}}
{{order.items[0].name}}

// ❌ Bad - Unclear
{{data}}
{{x}}
{{temp}}
```

### 2. Chain Transformations
```typescript
// ✅ Apply multiple transformations
{{user.email|trim|lowercase}}
{{user.name|capitalize|default:"Guest"}}

// Result is applied left to right
```

### 3. Use Type-Safe Paths
```typescript
// ✅ Use the variable picker to avoid typos
<VariablePicker onSelect={...} />

// ❌ Don't type paths manually
setEmail('{{usr.emai}}'); // Typo!
```

### 4. Preview Before Using
```typescript
// ✅ Always preview variable resolution
<VariablePreview />

// Check that all variables resolve correctly
```

---

## 🐛 Troubleshooting

### Variables not resolving?
**Solution:** Check the variable context is set:
```typescript
const { context, setContext } = useVariables();

setContext({
  variables: { user: { name: 'John' } },
  stepOutputs: {},
  globalVariables: {},
});
```

### Auto-suggest not showing?
**Solution:** Type `{{` to trigger suggestions:
```typescript
<VariableInput value={text} onChange={setText} />
// Type: Hello {{
// Suggestions appear!
```

### Transformation not working?
**Solution:** Check transformation syntax:
```typescript
// ✅ Correct
{{value|uppercase}}
{{price|round:2}}

// ❌ Wrong
{{value | uppercase}}  // No spaces!
{{price|round}}        // Missing argument
```

---

## 🎉 You're All Set!

The variable system is ready to use!

**Next Steps:**
- Try the email template example
- Create custom transformations
- Build dynamic forms
- Connect with execution engine

**Happy Coding!** 🚀✨
