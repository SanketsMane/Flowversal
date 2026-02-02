# 🎨 Connecting Lines Visual Reference

## Line Structure Overview

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    MAIN BRANCH (Gray)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

│ Main Vertical Line (Left side at x=40px)
│
├─(A)─→ Trigger Box
│   │
│   └── Sub Branch (Cyan #00C6FF)
│       │
│       ● ──→ Trigger 1 (Schedule)
│       │
│       ● ──→ Trigger 2 (Webhook)
│       │
│       ● ──→ Trigger 3 (Manual)
│
├─(B)─→ Workflow Step Box
│   │
│   └── Sub Branch (Purple #9D50BB)
│       │
│       ● ──→ Field 1 (Text Input)
│       │
│       ● ──→ Field 2 (Email Input)
│       │
│       ● ──→ Field 3 (Dropdown)
│
├─(C)─→ Workflow Step Box (Nodes)
│   │
│   └── Sub Branch (Green #10B981)
│       │
│       ● ──→ Node 1 (AI Prompt Builder)
│       │  │
│       │  └── Super Sub Branch (Orange #F59E0B)
│       │      │
│       │      ◉ ──→ Tool 1 (Web Search)
│       │      │
│       │      ◉ ──→ Tool 2 (Code Interpreter)
│       │
│       ● ──→ Node 2 (Data Processor)
│       │
│       ● ──→ Node 3 (Email Sender)
│
▼
```

---

## Detailed Branch Explanations

### **MAIN BRANCH** (Gray: #E0E0E0)
- **Type**: Vertical line on the LEFT side of canvas
- **Position**: x = 40px from left edge
- **Connects**:
  - Point (A) → First Trigger
  - Point (B) → First Field in Workflow Step
  - Point (C) → First Node in Workflow Step
- **Line Style**: 2px solid, straight vertical
- **Dot Style**: 6px radius, white border, gray fill

---

### **SUB BRANCH - Triggers** (Cyan: #00C6FF)
```
Main (A) ──→ Common Trigger Line ──┐
                    │               │
                    ● ──────────────┘ Trigger 1
                    │
                    ● ──────────────→ Trigger 2
                    │
                    ● ──────────────→ Trigger 3
```

- **Type**: Vertical line connecting all triggers
- **Position**: 30px left of first trigger box
- **Connects**: All triggers with horizontal branches
- **Line Style**: 2px solid cyan
- **Dot Style**: 6px radius, white border, cyan fill (10px glow)
- **Interactive**: Click dot to enable/disable trigger

---

### **SUB BRANCH - Fields** (Purple: #9D50BB)
```
Main (B) ──→ Common Field Line ──┐
                   │              │
                   ● ─────────────┘ Field 1
                   │
                   ● ─────────────→ Field 2
                   │
                   ● ─────────────→ Field 3
```

- **Type**: Vertical line connecting all fields in a workflow step
- **Position**: 30px left of first field box
- **Connects**: All fields with horizontal branches
- **Line Style**: 2px solid purple
- **Dot Style**: 6px radius, white border, purple fill (10px glow)
- **Interactive**: Click dot to enable/disable field

---

### **SUB BRANCH - Nodes** (Green: #10B981)
```
Main (C) ──→ Common Node Line ──┐
                   │             │
                   ● (D) ────────┘ Node 1 ──→ [Tools]
                   │
                   ● (D) ─────────→ Node 2 ──→ [Tools]
                   │
                   ● (D) ─────────→ Node 3
```

- **Type**: Vertical line connecting all nodes in a workflow step
- **Position**: 30px left of first node box
- **Connects**: All nodes with horizontal branches
- **Line Style**: 2px solid green
- **Dot Style**: 6px radius, white border, green fill (10px glow)
- **Interactive**: Click dot to enable/disable node
- **Note**: Each dot (D) can spawn a tools super sub-branch

---

### **SUPER SUB BRANCH - Tools** (Orange: #F59E0B)
```
Node 1 (D) ──→ Common Tool Line ──┐
                      │            │
                      ◉ ───────────┘ Tool 1 (Web Search)
                      │
                      ◉ ───────────→ Tool 2 (Code Interpreter)
                      │
                      ◉ ───────────→ Tool 3 (Calculator)
```

- **Type**: Vertical line connecting all tools within a node
- **Position**: 30px left of first tool box
- **Connects**: All tools of a specific node
- **Line Style**: 2px solid orange
- **Dot Style**: 6px radius, white border, orange fill (10px glow)
- **Interactive**: Click dot to enable/disable tool
- **Note**: Each node has its own independent tools branch

---

## Connection Dot States

### **Enabled Dot**
```
   ╔════════╗
   ║   ●    ║  ← Full color (cyan/purple/green/orange)
   ║  glow  ║  ← 10px shadow blur
   ╚════════╝
   Size: 6px radius (4px inner, 2px border)
```

### **Disabled Dot**
```
   ╔════════╗
   ║   ○    ║  ← Grayed out (#4A4A5E dark / #D1D5DB light)
   ║ no glow║  ← No shadow
   ╚════════╝
   Size: 6px radius (4px inner, 2px border)
```

### **Hover Effect (Future)**
```
   ╔════════╗
   ║   ●    ║  ← Slightly larger
   ║ +glow  ║  ← Enhanced glow (15px)
   ╚════════╝
   Size: 8px radius when hovered
```

---

## Data Attribute Reference

### **Triggers**
```tsx
<div data-trigger-id="trigger-123">
  Trigger Box
</div>
```

### **Containers (Workflow Steps)**
```tsx
<div data-container-id="container-456">
  Workflow Step
</div>
```

### **Fields**
```tsx
<div 
  data-container-index="0"
  data-element-index="2"
>
  Field Box
</div>
```

### **Nodes**
```tsx
<div 
  data-node-container="0"
  data-node-index="1"
>
  Node Box
</div>
```

### **Tools**
```tsx
<div 
  data-tool-node="0-1"
  data-tool-index="0"
>
  Tool Box
</div>
```

---

## Line Calculation Logic

### **Y-Position Calculation**
```javascript
// Get element's center point
const rect = element.getBoundingClientRect();
const canvasRect = canvas.getBoundingClientRect();
const y = rect.top - canvasRect.top + rect.height / 2;
```

### **Horizontal Line**
```javascript
// From dot to box
drawLine(dotX, y, boxLeftX, y, color);
```

### **Vertical Line (Sub-branch)**
```javascript
// Connect all dots vertically
drawLine(dotX, minY, dotX, maxY, color);
```

---

## Multiple Workflow Steps

When there are multiple workflow steps, each step gets its own set of lines:

```
Step 1:
│
├─(B1)─→ Fields Sub-branch (Purple)
│   ● Field 1-1
│   ● Field 1-2
│
├─(C1)─→ Nodes Sub-branch (Green)
│   ● Node 1-1
│
Step 2:
│
├─(B2)─→ Fields Sub-branch (Purple)
│   ● Field 2-1
│   ● Field 2-2
│
├─(C2)─→ Nodes Sub-branch (Green)
    ● Node 2-1
    ● Node 2-2
```

---

## Animation States

### **1. Line Appears (when item added)**
- Opacity: 0 → 1 (300ms ease-out)
- Length: Draw from left to right (optional)

### **2. Line Disappears (when item deleted)**
- Opacity: 1 → 0 (200ms ease-in)
- Scale: 1 → 0.8 (200ms ease-in)

### **3. Line Updates (when item reordered)**
- Position: Smooth transition (150ms ease-in-out)
- No opacity change

### **4. Dot Click**
- Scale: 1 → 1.2 → 1 (200ms bounce)
- Connected line opacity: Changes based on enabled state

---

## Z-Index Layering

```
z-50  : Modals & Dialogs
z-40  : Floating Panels
z-30  : Dropdowns
z-20  : Selected Items
z-10  : Workflow Boxes (Triggers, Fields, Nodes)
z-5   : Connecting Lines Canvas ← HERE
z-1   : Background Grid
z-0   : Base Canvas
```

---

## Performance Notes

- **Canvas Rendering**: Uses requestAnimationFrame for smooth 60fps
- **Redraw Triggers**: Window resize, scroll, item add/remove/reorder
- **Optimization**: Only redraws visible portion of canvas
- **Memory**: Canvas clears and redraws on each update (no memory leak)

---

## Responsive Behavior

### **Desktop (> 1024px)**
- Full line visibility
- All dots visible
- 2px line thickness

### **Tablet (768px - 1024px)**
- Line visibility maintained
- Dots slightly smaller (5px)
- 1.5px line thickness

### **Mobile (< 768px)**
- Lines hidden by default
- Can be toggled via settings
- Dots hidden to save space

---

## Color Palette Summary

| Element | Color Code | Usage |
|---------|-----------|--------|
| Main Branch | `#E0E0E0` | Main vertical line (dark mode) |
| Main Branch | `#9CA3AF` | Main vertical line (light mode) |
| Triggers | `#00C6FF` | Trigger sub-branch & dots |
| Fields | `#9D50BB` | Field sub-branch & dots |
| Nodes | `#10B981` | Node sub-branch & dots |
| Tools | `#F59E0B` | Tool super sub-branch & dots |
| Disabled | `#4A4A5E` | Disabled dots (dark mode) |
| Disabled | `#D1D5DB` | Disabled dots (light mode) |

---

## Example Workflow Visualization

```
TRIGGER AREA:
│
├─(A)─→ ● Manual Trigger (enabled, cyan dot with glow)
│       ● Schedule Trigger (disabled, gray dot)
│       ● Webhook Trigger (enabled, cyan dot with glow)
│
WORKFLOW STEP 1:
│
├─(B)─→ ● Name Field (enabled, purple dot)
│       ● Email Field (enabled, purple dot)
│       ● Message Field (disabled, gray dot)
│
├─(C)─→ ● AI Prompt Builder (enabled, green dot)
│   │     └─→ ◉ Web Search (enabled, orange dot)
│   │         ◉ Calculator (enabled, orange dot)
│   │
│   └─→ ● Email Sender (enabled, green dot)
│         └─→ ◉ Gmail API (enabled, orange dot)
│
WORKFLOW STEP 2:
│
├─(B)─→ ● Confirmation Message (enabled, purple dot)
│
▼
```

---

**This visual guide complements the integration guide. Use them together!**
