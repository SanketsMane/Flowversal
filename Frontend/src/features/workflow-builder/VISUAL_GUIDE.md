# 🎨 Visual Guide - Connection System

## Before & After

### **BEFORE (Phase 1 Only):**
```
    ┌──────────────┐
 ●──│  TRIGGER     │──●  ← Dots visible, no lines
    │  Schedule    │
    └──────────────┘

    ┌──────────────┐
 ●──│  STEP 1      │──●  ← Dots visible, no lines
    │              │
    └──────────────┘

    ┌──────────────┐
 ●──│  STEP 2      │──●  ← Dots visible, no lines
    │              │
    └──────────────┘
```

### **AFTER (Phase 2 Complete):**
```
    ┌──────────────┐
 ●──│  TRIGGER     │──●
    │  Schedule    │
    └──────┬───────┘
           │ 🟣 Purple curved line
           │
    ┌──────▼───────┐
 ●──│  STEP 1      │──●
    │              │
    └──────┬───────┘
           │ 🔵 Blue curved line
           │
    ┌──────▼───────┐
 ●──│  STEP 2      │──●
    │              │
    └──────────────┘
```

---

## Connection Line Types

### **1. Vertical Spine (Main Flow)**

**Used For:** Trigger→Step, Step→Step

**Visual:** Smooth S-curve
```
  Start ●
        │
        │  ╭─── Curve out
        │ ╭
        ╰─╯
          │  ╰─── Curve in
          │
  End   ●
```

**Code:**
```typescript
// Bezier curve with control points
`M ${fromX} ${fromY}
 C ${fromX} ${fromY + 40},
   ${toX} ${toY - 40},
   ${toX} ${toY}`
```

**Properties:**
- Width: 3px
- Color: Purple (#9D50BB) for trigger, Blue (#00C6FF) for steps
- Opacity: 0.8

---

### **2. Horizontal Branch (Side Connections)**

**Used For:** Spine↔Node connections

**Visual:** L-shape with rounded corner
```
Start ●────────┐
               │ ← 8px radius
               │
               └──● End
```

**Code:**
```typescript
// L-shape with quadratic curve
`M ${fromX} ${fromY}
 L ${cornerX} ${cornerY}
 Q ${toX} ${cornerY}, ${toX} ${endCornerY}
 L ${toX} ${toY}`
```

**Properties:**
- Width: 2px
- Color: Purple (#9D50BB)
- Corner radius: 8px
- Opacity: 0.8

---

### **3. Node-to-Node (Internal Flow)**

**Used For:** Node→Node within same step

**Visual:** Vertical S-curve (compact)
```
  Node 1 ●
         │
         │ ╭
         ╰─╯  ← Smaller curve (15px)
           │
  Node 2 ●
```

**Code:**
```typescript
// Compact S-curve
`M ${fromX} ${fromY}
 C ${fromX} ${fromY + 15},
   ${toX} ${toY - 15},
   ${toX} ${toY}`
```

**Properties:**
- Width: 2px
- Color: Purple (#9D50BB)
- Opacity: 0.8

---

## Complete Flow Example

### **Workflow:**
```
1 Trigger
2 Steps
Step 1 has 2 nodes
```

### **Visual Diagram:**
```
        ┌────────────────┐
     ●──│  📅 TRIGGER    │──●
        │  Every Hour    │
        └────────┬───────┘
                 │ 
                 │ 🟣 Line 1: Vertical Spine (purple)
                 │    trigger-output → step-input
                 ↓
        ┌────────────────────────────┐
     ●──┤  📦 STEP 1                 │──●
        │                            │
        │   ●─────┬──────────┬─────● │ ← Blue spine dots
        │         │          │       │
        │         │ 🟣 L2    │       │   Line 2: Horizontal Branch
        │         │          │       │   step-input → node-input
        │    ┌────▼────┐     │       │
        │    │ 🤖 LLM  │     │       │
        │    │  Chain  │     │       │
        │    └────┬────┘     │       │
        │         │          │       │
        │         │ 🟣 L3    │       │   Line 3: Node-to-Node
        │         │          │       │   node-output → node-input
        │         │          │       │
        │    ┌────▼─────┐    │       │
        │    │ 🌐 API    │   │       │
        │    │  Call     │   │       │
        │    └────┬──────┘   │       │
        │         │          │       │
        │         │ 🟣 L4    │       │   Line 4: Horizontal Branch
        │         │          │       │   node-output → step-output
        │         └──────────┘       │
        └────────────┬───────────────┘
                     │
                     │ 🔵 Line 5: Vertical Spine (blue)
                     │    step-output → step-input
                     ↓
        ┌────────────────────────────┐
     ●──│  📦 STEP 2                 │──●
        │                            │
        └────────────────────────────┘
```

**Total Lines: 5**
- Line 1: Purple vertical (Trigger → Step 1)
- Line 2: Purple L-shape (Step 1 spine → LLM node)
- Line 3: Purple vertical (LLM → API node)
- Line 4: Purple L-shape (API node → Step 1 spine)
- Line 5: Blue vertical (Step 1 → Step 2)

---

## Hover States

### **Normal State:**
```
────────  ← 2-3px width, 80% opacity
```

### **Hover State:**
```
═════════  ← +1px width, 100% opacity, glow effect
   ▓▓▓▓▓   ← 4px blur shadow
```

### **During Execution (Animated):**
```
─────➤───  ← Gradient animation, 2s duration
  ╰──➤──  ← Moving highlight
```

---

## Color Palette

### **Purple (#9D50BB):**
- Trigger outputs
- All node connections
- Node-to-node links
- Branch connections

### **Blue (#00C6FF):**
- Step-to-step spine
- Main vertical flow

### **Why Two Colors?**
- **Blue**: Represents the main "spine" of the workflow
- **Purple**: Represents "branches" and node logic

---

## Dot Types Reference

### **Connection Dot Anatomy:**
```
     ┌─── Size: 8px (small) or 12px (medium)
     │  ┌─ Color: blue/purple
     │  │
    (●)────── Position: left/right
     │
     └─── Type: input/output
```

### **Dot Colors:**
- 🔵 **Blue**: Step spine connections
- 🟣 **Purple**: Node connections

### **Dot Positions:**
- **Left**: Inputs (receive data)
- **Right**: Outputs (send data)

---

## Debug Mode Visualization

**Press `Ctrl+Shift+D` to toggle:**

### **Debug Overlay Shows:**
```
    ┌──────────────┐
 [●]│  TRIGGER     │[●] ← Dots highlighted with IDs
    │  Schedule    │    "trigger-123-output"
    └──────────────┘
         ║
         ║ ← Lines still visible
         ║
    ┌───▼──────────┐
 [●]│  STEP 1      │[●] ← Dot count shown
    │  (2 dots)    │
    └──────────────┘
```

### **Debug Info Panel:**
```
╔══════════════════════════╗
║ CONNECTION DEBUG         ║
║ ─────────────────────    ║
║ Total Dots: 8            ║
║ • trigger-input: 1       ║
║ • trigger-output: 1      ║
║ • step-input: 2          ║
║ • step-output: 2         ║
║ • node-input: 1          ║
║ • node-output: 1         ║
║                          ║
║ Total Lines: 5           ║
║ • vertical-spine: 3      ║
║ • horizontal-branch: 2   ║
║ • node-to-node: 0        ║
╚══════════════════════════╝
```

---

## Viewport Transforms

### **Zoom In (150%):**
```
       ┌──────────────┐
    ●──│  TRIGGER     │──●
       │  Schedule    │    ← Everything scales
       └──────┬───────┘       including lines
              │
              ↓
       ┌──────────────┐
    ●──│  STEP 1      │──●
       │              │
       └──────────────┘
```

### **Zoom Out (50%):**
```
  ┌──────┐
 ●│TRIG  │● ← Lines scale too
  └───┬──┘
      │
  ┌───▼──┐
 ●│STEP 1│●
  └──────┘
```

### **Pan:**
```
              ┌──────────────┐  ← Lines follow
           ●──│  TRIGGER     │──●   elements
              │  Schedule    │      during pan
              └──────┬───────┘
                     │
```

---

## Performance Characteristics

### **Render Time by Workflow Size:**

**Small (1T + 2S + 2N):**
- Dots: 8
- Lines: 5
- Render: < 16ms ✅

**Medium (1T + 5S + 10N):**
- Dots: 32
- Lines: ~20
- Render: < 50ms ✅

**Large (1T + 10S + 30N):**
- Dots: 82
- Lines: ~50
- Render: < 100ms ⚠️

**Extra Large (1T + 20S + 100N):**
- Dots: 242
- Lines: ~150
- Render: ~200ms ❌ (needs optimization)

---

## Best Practices

### **✅ DO:**
- Let connections auto-generate
- Use debug mode to verify dots
- Hover to inspect connections
- Zoom/pan to navigate large workflows

### **❌ DON'T:**
- Try to manually create connections (Phase 3)
- Delete auto-generated connections (Phase 3)
- Expect connections without dots
- Expect lines between incompatible types

---

## Troubleshooting Visual Guide

### **Problem: No lines visible**
```
    ┌──────────────┐
 ●──│  TRIGGER     │──●  ← Dots but no lines?
    └──────────────┘

    ┌──────────────┐
 ●──│  STEP 1      │──●  ← Check: Do you have
    └──────────────┘        at least 2 elements?
```

### **Problem: Lines in wrong position**
```
    ┌──────────────┐
 ●──│  TRIGGER     │──●
    └──────────────┘
           │
           │  ← Line doesn't connect to dot?
          ╱         Check: Refresh or toggle
         ╱          debug mode (Ctrl+Shift+D)
    ┌──────────────┐
 ●──│  STEP 1      │──●
    └──────────────┘
```

### **Problem: Hover doesn't work**
```
────────  ← Hover area is 12px wide
████████  ← Try hovering along this area
────────  ← Not just on the visible line
```

---

## 🎉 Summary

Phase 2 adds beautiful, auto-generated connection lines that:
- ✅ Connect all workflow elements
- ✅ Use smooth bezier curves
- ✅ Have professional hover effects
- ✅ Scale with viewport transforms
- ✅ Update automatically on changes

**Result: A professional, visual workflow builder!** 🎨✨
