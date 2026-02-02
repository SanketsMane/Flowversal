#!/bin/bash

# Fix backend import paths after restructuring
cd /Users/nishantkumar/Documents/FloversalAI\ 1.0.0/App/Backend/src

echo "🔄 Fixing backend import paths..."

# Update config imports
find services -name "*.ts" | xargs sed -i '' 's|../../config/|../core/config/|g'
find services -name "*.ts" | xargs sed -i '' 's|../config/|../core/config/|g'

# Update database imports
find services -name "*.ts" | xargs sed -i '' 's|../../db/|../core/database/|g'
find services -name "*.ts" | xargs sed -i '' 's|../db/|../core/database/|g'

# Update utils imports
find services -name "*.ts" | xargs sed -i '' 's|../../utils/|../shared/utils/|g'
find services -name "*.ts" | xargs sed -i '' 's|../utils/|../shared/utils/|g'

# Update jobs imports
find services -name "*.ts" | xargs sed -i '' 's|../../jobs/|../infrastructure/queue/|g'
find services -name "*.ts" | xargs sed -i '' 's|../jobs/|../infrastructure/queue/|g'

# Update model imports
find services -name "*.ts" | xargs sed -i '' 's|../db/models/|../core/database/models/|g'

# Update service-to-service imports
find services -name "*.ts" | xargs sed -i '' 's|../ai/|../modules/ai/services/|g'
find services -name "*.ts" | xargs sed -i '' 's|./ai/|./modules/ai/services/|g'

echo "✅ Backend import fixes completed!"
