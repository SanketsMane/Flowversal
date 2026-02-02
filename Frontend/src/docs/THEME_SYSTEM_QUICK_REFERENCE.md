# Theme System Quick Reference 🎨

Quick copy-paste reference for implementing theming in Flowversal components.

## For Main App Components (`/app`)

### Import
```typescript
import { useAppThemeStore, getThemeClasses } from '../stores/app/themeStore';
```

### Usage
```typescript
function MyComponent() {
  const { theme } = useAppThemeStore();
  const t = getThemeClasses(theme);
  
  return (
    <div className={t.bgMain}>
      <div className={`${t.bgCard} ${t.border} rounded-lg p-6`}>
        <h1 className={t.textPrimary}>Title</h1>
        <p className={t.textSecondary}>Description</p>
      </div>
    </div>
  );
}
```

### Toggle Theme
```typescript
const { toggleTheme } = useAppThemeStore();

<button onClick={toggleTheme}>
  Toggle Theme
</button>
```

## For Admin Panel Components (`/admin`)

### Import
```typescript
import { useThemeStore } from '../../../stores/admin/themeStore';
```

### Usage
```typescript
function MyAdminComponent() {
  const { theme } = useThemeStore();
  
  return (
    <div className={`${theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50'}`}>
      <h1 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Admin Title
      </h1>
    </div>
  );
}
```

## Theme Classes Cheat Sheet

### Main App (`getThemeClasses(theme)`)

```typescript
// Backgrounds
t.bgMain          // Main page background
t.bgCard          // Card/panel background  
t.bgSecondary     // Secondary background
t.bgInput         // Input field background

// Text
t.textPrimary     // Primary text (headings)
t.textSecondary   // Secondary text (body)
t.textTertiary    // Tertiary text (captions)
t.textMuted       // Muted text (hints)

// Borders
t.border          // Standard border
t.borderSecondary // Secondary border
t.borderHover     // Hover border effect

// Hover States
t.hoverBg         // Hover background
t.hoverBgSecondary// Secondary hover bg

// Other
t.divider         // Divider line
t.shadow          // Drop shadow
```

## Common Patterns

### Card Component
```typescript
<div className={`${t.bgCard} ${t.border} rounded-xl p-6 ${t.shadow}`}>
  <h2 className={`text-xl ${t.textPrimary} mb-2`}>Card Title</h2>
  <p className={`text-sm ${t.textSecondary}`}>Card content</p>
</div>
```

### Input Field
```typescript
<input
  className={`${t.bgInput} ${t.border} ${t.textPrimary} rounded-lg px-4 py-2 focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20`}
  placeholder="Enter text..."
/>
```

### Button with Theme
```typescript
<button className={`${t.bgSecondary} ${t.textPrimary} ${t.hoverBg} px-4 py-2 rounded-lg`}>
  Click Me
</button>
```

### List Item
```typescript
<li className={`${t.border} ${t.hoverBg} border-b last:border-b-0`}>
  <span className={t.textPrimary}>Item</span>
</li>
```

### Modal/Dialog
```typescript
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className={`${t.bgCard} ${t.border} ${t.shadow} rounded-2xl p-8 max-w-md`}>
    <h2 className={`text-2xl ${t.textPrimary} mb-4`}>Modal Title</h2>
    <p className={t.textSecondary}>Modal content</p>
  </div>
</div>
```

### Navigation Item
```typescript
<button 
  className={`${t.textSecondary} ${t.hoverBg} ${t.hoverText} px-4 py-2 rounded-lg transition-all`}
>
  Navigation
</button>
```

### Table Row
```typescript
<tr className={`${t.border} ${t.hoverBg} border-b`}>
  <td className={`px-4 py-3 ${t.textPrimary}`}>Cell 1</td>
  <td className={`px-4 py-3 ${t.textSecondary}`}>Cell 2</td>
</tr>
```

### Badge/Tag
```typescript
<span className={`${t.bgSecondary} ${t.textSecondary} px-3 py-1 rounded-full text-sm`}>
  Tag
</span>
```

## Color Reference

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| **Main Background** | `#0E0E1F` (Dark Navy) | `#F9FAFB` (Light Gray) |
| **Card Background** | `#1A1A2E` (Navy) | `#FFFFFF` (White) |
| **Secondary Background** | `#2A2A3E` (Medium Navy) | `#F3F4F6` (Gray 100) |
| **Primary Text** | `#FFFFFF` (White) | `#111827` (Gray 900) |
| **Secondary Text** | `#CFCFE8` (Light Purple) | `#4B5563` (Gray 600) |
| **Tertiary Text** | `#9CA3AF` (Gray 400) | `#6B7280` (Gray 500) |
| **Border** | `rgba(255,255,255,0.1)` | `#E5E7EB` (Gray 200) |

## Accent Colors (Always Same)

```typescript
// Gradient
from-[#00C6FF] via-[#0072FF] to-[#9D50BB]

// Individual
#00C6FF  // Cyan
#0072FF  // Blue  
#9D50BB  // Violet
```

## Tips

1. **Always use the helper**: `const t = getThemeClasses(theme)`
2. **Combine classes**: `${t.bgCard} ${t.border} rounded-lg`
3. **Maintain hierarchy**: Use textPrimary → textSecondary → textTertiary
4. **Test both modes**: Always check dark and light mode
5. **Be consistent**: Use the same pattern across similar components

## Example: Complete Component

```typescript
import { useAppThemeStore, getThemeClasses } from '../stores/app/themeStore';
import { Search, Filter } from 'lucide-react';

export function ExampleComponent() {
  const { theme } = useAppThemeStore();
  const t = getThemeClasses(theme);
  
  return (
    <div className={`min-h-screen ${t.bgMain} p-8`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl ${t.textPrimary} mb-2`}>Page Title</h1>
        <p className={t.textSecondary}>Page description</p>
      </div>
      
      {/* Search Bar */}
      <div className={`${t.bgCard} ${t.border} rounded-lg p-4 mb-6`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${t.textTertiary}`} />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full ${t.bgInput} ${t.border} ${t.textPrimary} pl-10 pr-4 py-2 rounded-lg`}
          />
        </div>
      </div>
      
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div 
            key={item}
            className={`${t.bgCard} ${t.border} ${t.shadow} rounded-xl p-6 ${t.hoverBg} transition-all cursor-pointer`}
          >
            <h3 className={`text-xl ${t.textPrimary} mb-2`}>Card {item}</h3>
            <p className={`${t.textSecondary} mb-4`}>Card description</p>
            <button className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white px-4 py-2 rounded-lg">
              Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

**Remember**: The theme system is designed to be simple and maintainable. When in doubt, check how it's used in Login.tsx or Signup.tsx!
