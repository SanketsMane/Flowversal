# 🚀 Phase 4 Part 1 - Usage Example

## Quick Start Guide

### 1. Wrap Your App with DndContextProvider

```typescript
// App.tsx or main layout file
import { DndContextProvider } from '@/features/workflow-builder';
import { CustomDragLayer } from '@/features/workflow-builder';

export default function App() {
  return (
    <DndContextProvider backend="auto">
      {/* Your app content */}
      <YourMainComponent />
      
      {/* Global drag layer for custom previews */}
      <CustomDragLayer />
    </DndContextProvider>
  );
}
```

### 2. Use FormFieldManager (Drag & Drop Already Working!)

```typescript
import { useState } from 'react';
import { FormFieldManager, FormField } from '@/features/workflow-builder';

export function MyFormBuilder() {
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'field-1',
      type: 'text',
      label: 'Full Name',
      required: true,
    },
    {
      id: 'field-2',
      type: 'email',
      label: 'Email Address',
      required: true,
    },
    {
      id: 'field-3',
      type: 'textarea',
      label: 'Message',
    },
  ]);

  return (
    <FormFieldManager
      fields={fields}
      onFieldsChange={setFields}
      formTitle="Contact Form"
      formDescription="Get in touch with us"
    />
  );
}
```

**That's it! Drag & drop is now working!** 🎉

- Drag fields to reorder
- See custom preview follow cursor
- Drop zones appear automatically
- Hover over fields to reorder

---

## 3. Access Drag State Globally

```typescript
import { useDndContext } from '@/features/workflow-builder';

export function MyComponent() {
  const { isDragging, dragType, dragItem } = useDndContext();

  return (
    <div>
      {isDragging ? (
        <div className="text-blue-500">
          Dragging {dragType}: {dragItem?.id}
        </div>
      ) : (
        <div>Nothing being dragged</div>
      )}
    </div>
  );
}
```

---

## 4. Create Custom Draggable Component

```typescript
import { DraggableWrapper } from '@/features/workflow-builder';

interface MyCardProps {
  item: any;
  index: number;
  onReorder: (from: number, to: number) => void;
}

export function MyDraggableCard({ item, index, onReorder }: MyCardProps) {
  return (
    <DraggableWrapper
      dragItem={{
        type: 'FORM_FIELD',
        id: item.id,
        index: index,
        data: item,
      }}
      onDragStart={() => {
        console.log('Started dragging', item.id);
      }}
      onDragEnd={(result) => {
        console.log('Dropped!', result);
      }}
      className="rounded-lg border p-4"
      dragClassName="opacity-40 scale-95"
    >
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </DraggableWrapper>
  );
}
```

---

## 5. Create Custom Drop Zone

```typescript
import { DndDropZone } from '@/features/workflow-builder';

export function MyList({ items, onItemsChange }) {
  const handleDrop = (dragItem, position) => {
    console.log('Dropped', dragItem, 'at position', position);
    // Handle the drop logic
  };

  return (
    <div>
      {/* Drop zone before first item */}
      <DndDropZone
        acceptTypes={['FORM_FIELD']}
        position={0}
        onDrop={handleDrop}
        isFirst
      />

      {/* Items with drop zones between */}
      {items.map((item, index) => (
        <div key={item.id}>
          <MyDraggableCard item={item} index={index} />
          
          <DndDropZone
            acceptTypes={['FORM_FIELD']}
            position={index + 1}
            onDrop={handleDrop}
            isLast={index === items.length - 1}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Use Utility Functions

```typescript
import { 
  reorderArray, 
  moveItemBetweenArrays,
  calculateDropPosition,
  snapToGrid,
} from '@/features/workflow-builder';

// Reorder items
const newArray = reorderArray(items, 2, 0); // Move item from index 2 to 0

// Move between arrays
const { source, destination } = moveItemBetweenArrays(
  sourceArray,
  destArray,
  sourceIndex,
  destIndex
);

// Calculate drop position
const position = calculateDropPosition(mouseY, elementRect);
// Returns: 'before' | 'after'

// Snap to grid
const snapped = snapToGrid({ x: 123, y: 456 }, 20);
// Returns: { x: 120, y: 460 }
```

---

## 7. Complete Example with State Management

```typescript
import { useState } from 'react';
import {
  DndContextProvider,
  FormFieldManager,
  CustomDragLayer,
  FormField,
  reorderArray,
} from '@/features/workflow-builder';

export function FormBuilderApp() {
  const [fields, setFields] = useState<FormField[]>([]);

  const handleFieldsChange = (newFields: FormField[]) => {
    setFields(newFields);
    console.log('Fields updated:', newFields);
  };

  return (
    <DndContextProvider>
      <div className="min-h-screen bg-[#0E0E1F] p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white text-3xl font-bold mb-8">
            Form Builder with Drag & Drop
          </h1>

          <FormFieldManager
            fields={fields}
            onFieldsChange={handleFieldsChange}
            formTitle="My Awesome Form"
            formDescription="Build beautiful forms with drag & drop"
          />
        </div>
      </div>

      {/* Global drag layer */}
      <CustomDragLayer />
    </DndContextProvider>
  );
}
```

---

## 🎯 Testing Your Drag & Drop

### Try These Actions:

1. **Add Some Fields**
   - Click "Add Field" button
   - Choose any field type
   - Add 3-4 fields

2. **Drag to Reorder**
   - Click and hold on grip icon (≡)
   - Drag field up or down
   - See custom preview follow cursor
   - See drop zones appear
   - Release to drop

3. **Hover Reordering**
   - Drag a field
   - Hover over another field
   - Watch them swap when you cross the middle

4. **Drop Zone Insertion**
   - Drag a field
   - Hover over a drop zone
   - See "Drop Here" indicator
   - Release to insert at that position

---

## 🐛 Troubleshooting

### Issue: Drag & Drop Not Working

**Solution:** Make sure you wrapped your app in `DndContextProvider`:

```typescript
import { DndContextProvider } from '@/features/workflow-builder';

<DndContextProvider>
  <YourApp />
</DndContextProvider>
```

### Issue: Custom Preview Not Showing

**Solution:** Add the `CustomDragLayer` component:

```typescript
import { CustomDragLayer } from '@/features/workflow-builder';

<DndContextProvider>
  <YourApp />
  <CustomDragLayer />
</DndContextProvider>
```

### Issue: Touch Not Working on Mobile

**Solution:** DndContextProvider auto-detects touch devices. If it's not working, try:

```typescript
<DndContextProvider backend="touch">
  <YourApp />
</DndContextProvider>
```

---

## 💡 Tips & Best Practices

### 1. Always Wrap in Provider
```typescript
// ✅ Good
<DndContextProvider>
  <FormFieldManager />
</DndContextProvider>

// ❌ Bad (won't work)
<FormFieldManager />
```

### 2. Use CustomDragLayer for Better UX
```typescript
// ✅ Good - Shows custom preview
<DndContextProvider>
  <YourApp />
  <CustomDragLayer />
</DndContextProvider>

// ⚠️ OK - Uses browser default
<DndContextProvider>
  <YourApp />
</DndContextProvider>
```

### 3. Keep Drag Items Lightweight
```typescript
// ✅ Good - Minimal data
dragItem={{
  type: 'FORM_FIELD',
  id: field.id,
  index: index,
}}

// ❌ Bad - Too much data
dragItem={{
  type: 'FORM_FIELD',
  ...entireField,
  ...allValidations,
  ...everythingElse,
}}
```

### 4. Use Memoization for Performance
```typescript
import { useMemo } from 'react';

const dragItem = useMemo(() => ({
  type: 'FORM_FIELD',
  id: field.id,
  index: index,
}), [field.id, index]);
```

---

## 🎉 You're All Set!

Drag & drop is now working in your form builder! 

**Next Steps:**
- Add more field types
- Customize drag preview
- Add validation on drop
- Extend to workflow steps (Part 2)
- Add execution engine (Part 2)
- Implement variable system (Part 3)

**Happy Dragging!** 🚀✨
