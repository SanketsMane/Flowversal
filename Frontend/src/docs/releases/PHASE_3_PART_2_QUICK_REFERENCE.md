# 📚 Phase 3 Part 2 - Quick Reference

## Field Properties System - At a Glance

---

## 🎯 Component Import

```typescript
import { 
  FieldProperties,
  FieldEditTab,
  FieldValidationsTab,
  FieldDataTab,
  FieldDefaultValueInput,
  FieldOptionsManager 
} from '@/features/workflow-builder';
```

---

## 🔧 Usage

### Basic Usage:

```typescript
<FieldProperties
  field={selectedField}
  onUpdate={(updates) => {
    // Merge updates
    setField({ ...field, ...updates });
  }}
  onClose={() => {
    // Close panel
    setSelectedField(null);
  }}
/>
```

---

## 📋 Field Type Support

### Default Value UI by Type:

| Field Type | UI Component | Example |
|------------|--------------|---------|
| `toggle`, `switch` | Switch | Toggle true/false |
| `radio`, `dropdown`, `select` | Select dropdown | Choose from options |
| `checklist` | Select dropdown | Choose from options |
| `date` | Calendar picker | Date-fns calendar |
| `time` | Time input | HH:MM input |
| `url`, `link` | URL input | https://... |
| `file`, `upload` | URL input | File URL |
| `image` | URL input | Image URL |
| `number` | Number input | Numeric value |
| `textarea`, `paragraph` | Textarea | Multi-line |
| `text`, `email` | Text input | Single line |

---

## 🎨 Tab Structure

### Edit Tab:
- Basic settings (label, placeholder, description)
- Options management (radio/dropdown/checklist)
- Default value (field-type-specific)
- Prefix & suffix (with AI prompts)
- Visibility controls
- Special field settings

### Validations Tab:
- Required field
- Length validation (min/max)
- Value range (numbers)
- Pattern validation (regex + tester)
- Email/URL validation
- Custom messages
- Validation summary

### Data Tab:
- Data mapping (key, variable)
- Persistence strategy
- Database configuration
- Data transformation
- Computed values
- Conditional display
- API integration
- Configuration summary

---

## 💾 Field Properties

### Edit Tab Properties:

```typescript
{
  label: string;
  placeholder?: string;
  description?: string;
  options?: string[]; // For radio/dropdown
  defaultValue?: any;
  toggleDefault?: boolean;
  prefix?: string;
  suffix?: string;
  prefixPrompt?: string;
  suffixPrompt?: string;
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  showInAdvanced?: boolean;
  linkName?: string; // URL fields
  linkUrl?: string;  // URL fields
  minWords?: number; // Text fields
  maxWords?: number; // Text fields
}
```

### Validations Tab Properties:

```typescript
{
  required?: boolean;
  validation?: {
    // Required
    requiredMessage?: string;
    
    // Length (text)
    minLength?: number;
    maxLength?: number;
    lengthMessage?: string;
    
    // Range (number)
    min?: number;
    max?: number;
    rangeMessage?: string;
    
    // Pattern
    pattern?: string;
    patternMessage?: string;
    
    // Email
    strictEmail?: boolean;
    emailMessage?: string;
    
    // URL
    requireHttps?: boolean;
    urlMessage?: string;
    
    // Custom
    customMessage?: string;
  }
}
```

### Data Tab Properties:

```typescript
{
  // Mapping
  dataKey?: string;
  variable?: string;
  
  // Persistence
  persistence?: 'none' | 'client' | 'server';
  dbTable?: string;
  
  // Transformation
  transform?: string;
  customTransform?: string;
  
  // Computed
  computedFormula?: string;
  isComputed?: boolean;
  
  // Conditional
  showWhen?: string;
  hideWhen?: string;
  
  // API
  apiEndpoint?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  validateOnBlur?: boolean;
}
```

---

## 🎯 Common Use Cases

### 1. Simple Text Field

```typescript
const field: FormField = {
  id: 'field-1',
  type: 'text',
  label: 'Full Name',
  placeholder: 'John Doe',
  required: true,
  validation: {
    minLength: 2,
    maxLength: 50,
    lengthMessage: 'Name must be 2-50 characters'
  }
};
```

### 2. Email Field with Validation

```typescript
const field: FormField = {
  id: 'field-2',
  type: 'email',
  label: 'Email Address',
  placeholder: 'you@example.com',
  required: true,
  validation: {
    strictEmail: true,
    emailMessage: 'Please enter a valid email'
  },
  dataKey: 'user_email',
  variable: '{{email}}',
  persistence: 'server',
  dbTable: 'users'
};
```

### 3. Dropdown with Options

```typescript
const field: FormField = {
  id: 'field-3',
  type: 'dropdown',
  label: 'Country',
  options: ['USA', 'Canada', 'UK', 'Australia'],
  defaultValue: 'USA',
  required: true,
  dataKey: 'user_country'
};
```

### 4. Toggle with Default

```typescript
const field: FormField = {
  id: 'field-4',
  type: 'toggle',
  label: 'Subscribe to newsletter',
  toggleDefault: true,
  dataKey: 'newsletter_opt_in'
};
```

### 5. Number with Range

```typescript
const field: FormField = {
  id: 'field-5',
  type: 'number',
  label: 'Age',
  placeholder: '18',
  validation: {
    min: 18,
    max: 120,
    rangeMessage: 'Age must be between 18 and 120'
  }
};
```

### 6. URL with HTTPS Required

```typescript
const field: FormField = {
  id: 'field-6',
  type: 'url',
  label: 'Website',
  placeholder: 'https://example.com',
  validation: {
    requireHttps: true,
    urlMessage: 'Please use HTTPS'
  }
};
```

### 7. Date Picker

```typescript
const field: FormField = {
  id: 'field-7',
  type: 'date',
  label: 'Birth Date',
  defaultValue: '2000-01-01',
  required: true,
  dataKey: 'birth_date'
};
```

### 8. Pattern Validation

```typescript
const field: FormField = {
  id: 'field-8',
  type: 'text',
  label: 'Username',
  placeholder: 'username123',
  validation: {
    pattern: '^[a-zA-Z0-9_]{3,20}$',
    patternMessage: 'Username must be 3-20 alphanumeric characters'
  }
};
```

### 9. Computed Field

```typescript
const field: FormField = {
  id: 'field-9',
  type: 'number',
  label: 'Total Price',
  computedFormula: '{{price}} * {{quantity}}',
  isComputed: true,
  readOnly: true
};
```

### 10. Conditional Field

```typescript
const field: FormField = {
  id: 'field-10',
  type: 'text',
  label: 'Company Name',
  showWhen: '{{account_type}} === "business"',
  required: true
};
```

---

## 🔄 Update Handlers

### Simple Update:

```typescript
onUpdate({ label: 'New Label' });
```

### Nested Update (Validation):

```typescript
onUpdate({
  validation: {
    ...field.validation,
    minLength: 5,
    lengthMessage: 'Minimum 5 characters'
  }
});
```

### Multiple Properties:

```typescript
onUpdate({
  label: 'Email',
  placeholder: 'your@email.com',
  required: true,
  validation: {
    strictEmail: true
  }
});
```

---

## 🎨 Styling Classes

### Theme Colors:
```typescript
const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
```

### Gradient Button:
```typescript
className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90"
```

### Active Tab:
```typescript
className={activeTab === 'edit' 
  ? 'border-[#00C6FF] text-[#00C6FF]'
  : 'border-transparent text-[#CFCFE8]'
}
```

---

## 🧪 Testing Pattern Regex

### Built-in Tester:

```typescript
const testPattern = () => {
  if (!validation.pattern || !testValue) return null;
  try {
    const regex = new RegExp(validation.pattern);
    return regex.test(testValue);
  } catch (e) {
    return null;
  }
};

const result = testPattern();
// result: true (valid) | false (invalid) | null (no test)
```

### Visual Feedback:

```tsx
{result !== null && (
  <div className={result 
    ? 'bg-green-500/10 border-green-500/20' 
    : 'bg-red-500/10 border-red-500/20'
  }>
    {result ? <Check /> : <X />}
  </div>
)}
```

---

## 📦 Dependencies

### Required Packages:
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `@/components/ui/*` - ShadCN components
  - Button
  - Input
  - Switch
  - Calendar
  - Popover

### ShadCN Components Used:
```bash
Button, Input, Switch, Calendar, Popover
```

---

## 🎯 Key Features Checklist

### Edit Tab:
- [x] Label, Placeholder, Description
- [x] Options Manager (Add/Edit/Delete)
- [x] Field-type-specific default value UI
- [x] Prefix & Suffix with AI prompts
- [x] Visibility controls (Required, Hidden, Read-only)
- [x] Special field settings (Links, Word limits)

### Validations Tab:
- [x] Required field with custom message
- [x] Min/Max length validation
- [x] Min/Max value validation (numbers)
- [x] Pattern validation with live tester
- [x] Email validation (strict mode)
- [x] URL validation (HTTPS)
- [x] Validation summary

### Data Tab:
- [x] Data key and variable mapping
- [x] Persistence strategy (None/Client/Server)
- [x] Database table selection
- [x] Data transformation (built-in + custom)
- [x] Computed values with formulas
- [x] Conditional display (show/hide when)
- [x] API integration (endpoint, method)
- [x] Configuration summary

---

## 🚀 Quick Start

### 1. Import Component

```typescript
import { FieldProperties } from '@/features/workflow-builder';
```

### 2. Setup State

```typescript
const [selectedField, setSelectedField] = useState<FormField | null>(null);
```

### 3. Render Panel

```typescript
{selectedField && (
  <FieldProperties
    field={selectedField}
    onUpdate={(updates) => {
      setSelectedField({ ...selectedField, ...updates });
    }}
    onClose={() => setSelectedField(null)}
  />
)}
```

### 4. Done!

Users can now:
- Edit field properties in Edit tab
- Configure validations in Validations tab
- Setup data mapping in Data tab

---

## 📈 Performance Tips

1. **Memoize Callbacks:**
   ```typescript
   const handleUpdate = useCallback((updates) => {
     // Update logic
   }, [dependencies]);
   ```

2. **Lazy Load Tabs:**
   - Only render active tab content
   - Current implementation already does this

3. **Debounce Input:**
   - For live pattern testing
   - For API validation

---

## 🎉 Success!

**Phase 3 Part 2 Complete - Field Properties Ready!** ✨

All features working, type-safe, and production-ready!
