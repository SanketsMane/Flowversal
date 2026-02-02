# Connection System Testing Guide

## Quick Start

1. **Launch the app** and navigate to the workflow builder
2. **Press `Ctrl+Shift+D`** to enable debug mode
3. **Add a trigger** using the floating + button

You should see:
- A purple dot on the right side of the trigger card
- A yellow circle overlaying that dot (debug visualization)
- Debug panel in top-right showing "Total Points: 1"

## Step-by-Step Testing

### Test 1: Single Trigger Connection Dot

**Steps:**
1. Open workflow builder
2. Click floating + button (top-left)
3. Add a "Schedule" trigger
4. Press `Ctrl+Shift+D`

**Expected Result:**
- Purple dot visible on right side of trigger card
- Debug overlay shows:
  ```
  Total Points: 1
  Triggers: 1
  ```
- Console log shows: `Registered connection point: trigger-[id]:trigger-output`

### Test 2: Multiple Triggers

**Steps:**
1. Add 3 different triggers
2. Enable debug mode

**Expected Result:**
- Each trigger has its own purple dot
- Debug panel shows "Total Points: 3"
- Each dot has unique ID in the list

### Test 3: Position Updates on Scroll

**Steps:**
1. Add a trigger
2. Enable debug mode
3. Scroll the canvas vertically
4. Watch the debug panel coordinates

**Expected Result:**
- Yellow debug circle moves with the trigger
- Position coordinates update in real-time
- No lag or jitter

### Test 4: Position Updates on Zoom

**Steps:**
1. Add a trigger
2. Enable debug mode
3. Use mouse wheel to zoom canvas
4. Watch the connection dot

**Expected Result:**
- Dot remains positioned correctly relative to trigger
- Debug circle stays aligned
- Position updates smoothly

### Test 5: Drag Trigger Card

**Steps:**
1. Add a trigger
2. Enable debug mode
3. Drag the trigger to reorder it

**Expected Result:**
- Connection dot moves with the trigger card
- Position updates during drag
- No visual glitches

### Test 6: Theme Switching

**Steps:**
1. Add a trigger with connection dot
2. Toggle between light and dark mode
3. Observe the connection dot colors

**Expected Result:**
- Dark mode: Brighter purple (`bg-purple-500`)
- Light mode: Darker purple (`bg-purple-600`)
- Transitions smoothly

### Test 7: Debug Overlay Interaction

**Steps:**
1. Add multiple triggers
2. Press `Ctrl+Shift+D` to open debug overlay
3. Scroll through the connection point list
4. Click the X button to close

**Expected Result:**
- Panel opens/closes smoothly
- All dots listed with correct info
- Stats are accurate
- Panel scrolls if list is long

### Test 8: Console Debugging

**Steps:**
1. Open browser console (F12)
2. Add a trigger
3. Look for connection-related logs

**Expected Result:**
```
Registry updated: 1 points
Registered: trigger-[id]:trigger-output at (x, y)
```

### Test 9: Performance Test

**Steps:**
1. Add 10 triggers
2. Enable debug mode
3. Scroll rapidly up and down
4. Monitor console for errors

**Expected Result:**
- No lag or stuttering
- Position updates smooth
- No console errors
- No memory leaks (check Performance tab)

### Test 10: Cleanup Test

**Steps:**
1. Add 5 triggers
2. Enable debug mode (should show 5 points)
3. Delete 2 triggers
4. Check debug panel

**Expected Result:**
- Debug panel shows 3 points (not 5)
- Deleted trigger dots removed from registry
- No orphaned entries

## Advanced Testing

### Test with Workflow Steps (When Implemented)

```
Expected Flow:
1. Add trigger → purple dot on right
2. Add step → blue dot on left, blue dot on right
3. Add node → green dot on left, green dot on right
4. Debug shows all dots with correct types
```

### Test Branch Connections (Future)

```
Expected Flow:
1. Add If node with 2 branches
2. Branch cards show red dots
3. Debug panel shows branch connection types
```

## Visual Inspection Checklist

When debug mode is enabled:

- [ ] Purple dots on triggers (right side)
- [ ] Yellow debug circles perfectly aligned with dots
- [ ] Debug panel shows correct count
- [ ] Dot IDs are unique and descriptive
- [ ] Coordinates update in real-time
- [ ] Type breakdown matches visual count
- [ ] No duplicate entries
- [ ] Theme colors are correct

## Common Issues & Solutions

### Issue: Dot not visible
**Check:**
- Is the trigger card rendered?
- Is z-index correct? (should be 20)
- Is the dot disabled? (check `disabled` prop)

### Issue: Position is wrong
**Check:**
- Does parent element have position: relative?
- Is `.workflow-canvas` class present?
- Are transforms applied correctly?

### Issue: Debug panel empty
**Check:**
- Are dots actually mounting?
- Check console for registration logs
- Verify registry is being used correctly

### Issue: Position doesn't update
**Check:**
- Is MutationObserver working?
- Is ResizeObserver supported?
- Are scroll events being captured?

## Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

Required APIs:
- MutationObserver ✅
- ResizeObserver ✅
- getBoundingClientRect() ✅

## Performance Benchmarks

Expected performance:
- **10 dots**: < 1ms update time
- **50 dots**: < 5ms update time
- **100 dots**: < 10ms update time

Monitor with:
```javascript
performance.mark('update-start');
// ... position update code
performance.mark('update-end');
performance.measure('update', 'update-start', 'update-end');
```

## Debugging Tips

### 1. Check Registry State

Open console and run:
```javascript
// Access the registry (in browser console)
window.connectionRegistry = useConnectionRegistry.getState();
window.connectionRegistry.getAllPoints();
```

### 2. Force Position Update

```javascript
// Manually trigger position update for all dots
document.querySelectorAll('[data-connection-dot-id]').forEach(dot => {
  dot.dispatchEvent(new Event('update-position'));
});
```

### 3. Visual Debug Mode

Add this to browser console:
```javascript
// Highlight all connection dots
document.querySelectorAll('[data-connection-dot-id]').forEach(dot => {
  dot.style.outline = '3px solid yellow';
  dot.style.zIndex = '9999';
});
```

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Steps to reproduce
3. Screenshot with debug mode enabled
4. Console logs
5. Expected vs actual behavior

## Next Steps

After Phase 1 is verified:
- Add connection dots to StepContainer
- Add connection dots to NodeCard
- Implement Phase 2 (connection lines)
- Add drag-to-connect interaction
