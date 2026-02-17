#!/bin/bash

# Script to move remaining components to their proper locations
cd /Users/nishantkumar/Documents/FloversalAI\ 1.0.0/App/Frontend/src

echo "🔄 Moving remaining components to proper locations..."

# Move auth components (if any remaining)
find components -name "*Auth*" -o -name "*Login*" -o -name "*Register*" | xargs -I {} mv {} features/auth/components/ 2>/dev/null || true

# Move modal components to shared/ui
find components -name "*Modal*" | xargs -I {} mv {} shared/components/ui/ 2>/dev/null || true

# Move remaining UI components to shared/ui
find components -name "*Dialog*" -o -name "*Notification*" -o -name "*Popup*" -o -name "*Dropdown*" | xargs -I {} mv {} shared/components/ui/ 2>/dev/null || true

# Move form components to shared/forms
mkdir -p shared/components/forms
find components -name "*Form*" -o -name "*Input*" | xargs -I {} mv {} shared/components/forms/ 2>/dev/null || true

# Move remaining layout components
find components -name "*Layout*" -o -name "*Container*" -o -name "*Wrapper*" | xargs -I {} mv {} shared/components/layout/ 2>/dev/null || true

# Move any remaining components to shared/ui as a fallback
find components -type f -name "*.tsx" | head -10 | xargs -I {} mv {} shared/components/ui/ 2>/dev/null || true

# Remove empty components directory if it exists
rmdir components 2>/dev/null || true

echo "✅ Component reorganization completed!"
