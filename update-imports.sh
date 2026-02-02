#!/bin/bash

# Script to update imports in the restructured codebase
# Run from the root directory

echo "🔄 Updating import statements for restructured codebase..."

# Update ThemeContext imports
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../../components/ThemeContext'\''|from '\''@/core/theme/ThemeContext'\''|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../components/ThemeContext'\''|from '\''@/core/theme/ThemeContext'\''|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''./ThemeContext'\''|from '\''@/core/theme/ThemeContext'\''|g'

# Update AuthContext imports
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../../contexts/AuthContext'\''|from '\''@/core/auth/AuthContext'\''|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../contexts/AuthContext'\''|from '\''@/core/auth/AuthContext'\''|g'

# Update ModalContext imports
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../../contexts/ModalContext'\''|from '\''@/core/store/ModalContext'\''|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../contexts/ModalContext'\''|from '\''@/core/store/ModalContext'\''|g'

# Update service imports
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../../services/|from '\''@/core/api/services/|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../services/|from '\''@/core/api/services/|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''./services/|from '\''@/core/api/services/|g'

# Update store imports
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../../stores/|from '\''@/core/store/|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../stores/|from '\''@/core/store/|g'

# Update lib imports
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../../lib/|from '\''@/shared/lib/|g'
find App/Frontend/src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''../lib/|from '\''@/shared/lib/|g'

echo "✅ Import updates completed!"
echo "Note: Some manual updates may still be needed for complex import paths."
