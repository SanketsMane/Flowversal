# 🧪 Phase 2 Testing Guide

## Quick Visual Test

### **Test 1: Basic Flow (2 minutes)**

1. **Setup:**
   - Open workflow builder
   - Add a Schedule trigger
   - Add Step 1
   - Add Step 2

2. **Expected Result:**
   ```
   ┌─────────┐
   │ Trigger │ 🔵●──●🟣
   └────┬────┘
        │ Purple line (vertical-spine)
        ↓
   ┌─────────┐
   │ Step 1  │ 🔵●──●🔵
   └────┬────┘
        │ Blue line (vertical-spine)
        ↓
   ┌─────────┐
   │ Step 2  │ 🔵●──●🔵
   └─────────┘
   ```

3. **Verify:**
   - [ ] Purple line from trigger to Step 1
   - [ ] Blue line from Step 1 to Step 2
   - [ ] Lines have smooth S-curves
   - [ ] Lines connect to dot centers

---

### **Test 2: Nodes in Step (3 minutes)**

1. **Setup:**
   - Use workflow from Test 1
   - Click "+ Add Node" in Step 1
   - Add "LLM Chain" node
   - Add another "API Call" node

2. **Expected Result:**
   ```
   ┌─────────┐
   │ Trigger │●─────●
   └────┬────┘
        │ Purple
        ↓
   ┌───────────────────────┐
   │ Step 1           ●────┼──● (blue left dot)
   │                       │
   │  ●──┬───────┬──●      │
   │     │       │         │
   │  ┌──▼─────┐ │         │
   │  │ LLM    │ │         │
   │  │ Chain  │ │         │
   │  └──┬─────┘ │         │
   │     │       │         │
   │  ●──┘   ┌───▼──●      │
   │         │ API   │     │
   │         │ Call  │     │
   │         └───────┘     │
   │                  ●────┼──● (blue right dot)
   └───────────────────────┘
        │ Blue
        ↓
   ┌─────────┐
   │ Step 2  │
   └─────────┘
   ```

3. **Verify:**
   - [ ] Purple L-shaped line from step spine to LLM Chain (left side)
   - [ ] Purple vertical line from LLM Chain to API Call
   - [ ] Purple L-shaped line from API Call back to step spine (right side)
   - [ ] All lines have smooth curves/rounded corners
   - [ ] No overlapping lines

---

### **Test 3: Hover Effects (1 minute)**

1. **Hover over each line type:**
   - Purple trigger→step line
   - Blue step→step line
   - Purple node connections

2. **Verify for EACH line:**
   - [ ] Line thickness increases
   - [ ] Glow effect appears
   - [ ] Opacity increases to 100%
   - [ ] Cursor stays as grab (not pointer)
   - [ ] Effect disappears on mouse leave

---

### **Test 4: Viewport Transforms (2 minutes)**

1. **Zoom Test:**
   - Scroll to zoom in (Ctrl+Wheel or Cmd+Wheel)
   - Scroll to zoom out

2. **Pan Test:**
   - Click and drag canvas
   - Pan in all directions

3. **Verify:**
   - [ ] Connection lines scale with content
   - [ ] Lines stay connected to dots during zoom
   - [ ] Lines follow elements during pan
   - [ ] No "jumping" or disconnection
   - [ ] Hover still works after transform

---

### **Test 5: Debug Mode (1 minute)**

1. **Enable Debug:**
   - Press `Ctrl+Shift+D`

2. **Verify:**
   - [ ] All dots are highlighted
   - [ ] Dot IDs are visible
   - [ ] Count matches: `(Triggers × 2) + (Steps × 2) + (Nodes × 2)`
   - [ ] No orphan dots (dots without connections)

3. **Example Count:**
   - 1 Trigger = 2 dots
   - 2 Steps = 4 dots
   - 2 Nodes = 4 dots
   - **Total: 10 dots**

---

### **Test 6: Form Node (1 minute)**

1. **Setup:**
   - In any step, click "+ Add Node"
   - Select "Form" node

2. **Verify:**
   - [ ] Form node has purple dot on left
   - [ ] Form node has purple dot on right
   - [ ] Dots are same size as other node dots
   - [ ] Connections work same as regular nodes

---

### **Test 7: Dynamic Updates (2 minutes)**

1. **Add Node:**
   - Add a node to Step 1
   - Verify connections update immediately

2. **Remove Node:**
   - Delete a node
   - Verify connections regenerate correctly

3. **Add Step:**
   - Add Step 3
   - Verify blue line appears between Step 2 and Step 3

4. **Remove Step:**
   - Delete Step 2
   - Verify connections update (Step 1 → Step 3)

5. **Verify:**
   - [ ] All updates happen immediately
   - [ ] No orphan lines (lines without endpoints)
   - [ ] No missing connections
   - [ ] No console errors

---

## 🐛 Common Issues & Fixes

### **Issue: No lines visible**
- **Check:** Are there at least 2 connected elements (trigger + step)?
- **Fix:** Add a trigger and at least one step

### **Issue: Lines don't connect to dots**
- **Check:** Debug mode (Ctrl+Shift+D) - are dots registered?
- **Fix:** Dots auto-register on mount. Try refreshing.

### **Issue: Lines are in wrong position**
- **Check:** Viewport offset - is it (120, 80)?
- **Fix:** Reset viewport or re-pan canvas

### **Issue: Hover doesn't work**
- **Check:** Are you hovering directly on the line?
- **Fix:** Hit area is 12px wide, try hovering closer to line center

### **Issue: Lines don't update on zoom**
- **Check:** Console for errors
- **Fix:** Viewport transform should auto-update ConnectionLayer

---

## 📊 Performance Benchmarks

### **Expected Performance:**

| Workflow Size | Dots | Connections | Render Time |
|---------------|------|-------------|-------------|
| Small (1T + 2S + 2N) | 8 | 5 | < 16ms |
| Medium (1T + 5S + 10N) | 32 | 20+ | < 50ms |
| Large (1T + 10S + 30N) | 82 | 50+ | < 100ms |

### **Test Performance:**

1. Open Dev Tools → Performance tab
2. Record while adding nodes
3. Look for `ConnectionLayer` render time
4. Should be < 50ms for medium workflows

---

## ✅ Acceptance Criteria

**Phase 2 is complete when ALL of these pass:**

### **Visual:**
- [ ] All line types render correctly (vertical-spine, horizontal-branch, node-to-node)
- [ ] Lines are smooth curves (no straight jagged lines)
- [ ] Colors match spec (purple #9D50BB, blue #00C6FF)
- [ ] Lines are partially transparent (opacity 0.8)
- [ ] Hover effects work (glow, thickness, opacity)

### **Functional:**
- [ ] Auto-connection generates on workflow changes
- [ ] Lines update on add/remove elements
- [ ] Lines follow elements during pan/zoom
- [ ] Debug mode shows all registered dots
- [ ] No console errors

### **Interactive:**
- [ ] Hover over lines shows glow effect
- [ ] Hit area is wide enough (12px)
- [ ] No interference with element dragging
- [ ] Zoom/pan don't break connections

### **Code Quality:**
- [ ] TypeScript compiles with no errors
- [ ] No unused imports
- [ ] Components follow naming conventions
- [ ] Files are in correct directories

---

## 🎯 Sign-Off Checklist

Before considering Phase 2 complete:

- [ ] All 7 tests pass
- [ ] All acceptance criteria met
- [ ] Performance is acceptable
- [ ] No console errors or warnings
- [ ] Code is documented
- [ ] Ready for Phase 3 (interactive connections)

---

## 📸 Screenshots to Take

For documentation:

1. **Basic flow**: Trigger → Step → Step with lines
2. **With nodes**: Step containing 2-3 nodes with internal connections
3. **Hover state**: Line with glow effect
4. **Debug mode**: Showing all dots highlighted
5. **Zoomed in**: Close-up of connection point
6. **Complex workflow**: Multiple steps with multiple nodes

---

## 🎉 Success Metrics

**Phase 2 is successful if:**
- ✅ Visual connections appear automatically
- ✅ Lines look professional (smooth, styled)
- ✅ Interactions feel responsive
- ✅ System is stable (no crashes/errors)
- ✅ Code is maintainable (clean, documented)
- ✅ Ready for Phase 3 enhancements

---

**Testing Status: READY FOR USER TESTING** 🚀
