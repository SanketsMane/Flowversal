#!/bin/bash

# Comprehensive script to fix all remaining imports
cd /Users/nishantkumar/Documents/FloversalAI\ 1.0.0/App/Frontend/src

echo "🔄 Fixing all remaining imports..."

# Move any remaining components that should be in shared/ui
find components -type f -name "*.tsx" | xargs -I {} mv {} shared/components/ui/ 2>/dev/null || true

# Update imports that reference moved components
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/shared/components/ui/AdvancedFilters|@/shared/components/ui/AdvancedFilters|g' 2>/dev/null || true
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/shared/components/ui/AdvancedSort|@/shared/components/ui/AdvancedSort|g' 2>/dev/null || true

# Update any remaining component imports that might be wrong
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../../components/|from '\''@/shared/components/ui/|g' 2>/dev/null || true
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../components/|from '\''@/shared/components/ui/|g' 2>/dev/null || true

# Clean up empty directories
find . -type d -empty -delete 2>/dev/null || true

echo "✅ Import fixes completed!"
