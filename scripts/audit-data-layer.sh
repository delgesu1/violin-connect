#!/bin/bash
# Comprehensive audit script for Violin Connect data layer
# This script searches for potential issues in the data layer implementation
# that might not conform to the patterns in DATABASE_WORKFLOW.md

echo "🔍 Running Violin Connect Data Layer Audit"
echo "==========================================="
echo ""

# Set variables
SRC_DIR="src"
BASE_DIR=$(pwd)
RESULTS_DIR="$BASE_DIR/audit-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_FILE="$RESULTS_DIR/data_layer_audit_$TIMESTAMP.md"

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Initialize results file
cat > "$RESULTS_FILE" << EOL
# Violin Connect Data Layer Audit
**Generated on:** $(date)

This audit helps identify potential issues with the data layer implementation
that might not conform to the patterns described in DATABASE_WORKFLOW.md.

## Summary

EOL

# -----------------------------------------
# PART 1: Check for non-UUID string IDs
# -----------------------------------------
echo "Checking for non-UUID string IDs..."
echo "## 1. Non-UUID String IDs" >> "$RESULTS_FILE"
echo "These patterns suggest the code might be using simple string IDs instead of proper UUIDs:" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Common string ID patterns
patterns=(
  "'student-[0-9]"
  "\"student-[0-9]"
  "'teacher-[0-9]"
  "\"teacher-[0-9]"
  "'lesson-[0-9]"
  "\"lesson-[0-9]"
  "'s-[0-9]"
  "\"s-[0-9]"
  "'p-[0-9]"
  "\"p-[0-9]"
  "'l-[0-9]"
  "\"l-[0-9]"
)

for pattern in "${patterns[@]}"; do
  COUNT=$(grep -r $pattern --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | wc -l)
  echo "Found $COUNT occurrences of $pattern" 
  
  if [ $COUNT -gt 0 ]; then
    echo "### Pattern: $pattern" >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    grep -r $pattern --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
  fi
done

# -----------------------------------------
# PART 2: Check for ID prefix creation instead of real UUIDs
# -----------------------------------------
echo "Checking for ID prefix usage..."
echo "## 2. ID Prefix Creation" >> "$RESULTS_FILE"
echo "These functions create prefixed IDs which might not be compatible with the database schema:" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# ID prefix patterns
id_patterns=(
  "createPrefixedId"
  "ID_PREFIXES"
  "getIdWithoutPrefix"
)

for pattern in "${id_patterns[@]}"; do
  COUNT=$(grep -r $pattern --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | grep -v "id-utils.ts" | wc -l)
  echo "Found $COUNT occurrences of $pattern"
  
  if [ $COUNT -gt 0 ]; then
    echo "### Pattern: $pattern" >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    grep -r $pattern --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | grep -v "id-utils.ts" >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
  fi
done

# -----------------------------------------
# PART 3: Check for proper dev-uuids.ts usage
# -----------------------------------------
echo "Checking for dev-uuids.ts usage..."
echo "## 3. UUID Usage" >> "$RESULTS_FILE"
echo "Components should import and use UUIDs from dev-uuids.ts:" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Count hooks that DON'T import the dev UUIDs
HOOK_FILES=$(find $SRC_DIR -name "use*.ts" -type f | grep -v "test")
MISSING_UUID_IMPORTS=0

echo "### Hooks missing dev-uuid imports" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"

for hook in $HOOK_FILES; do
  if ! grep -q "dev-uuids" "$hook"; then
    echo "Missing dev-uuids import: $hook"
    echo "$hook" >> "$RESULTS_FILE"
    ((MISSING_UUID_IMPORTS++))
  fi
done

echo "\`\`\`" >> "$RESULTS_FILE"
echo "Total hooks missing dev-uuid imports: $MISSING_UUID_IMPORTS" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# -----------------------------------------
# PART 4: Check for hybrid caching approach
# -----------------------------------------
echo "Checking for hybrid caching implementation..."
echo "## 4. Hybrid Caching Approach" >> "$RESULTS_FILE"
echo "Hooks should follow the database → cache → mock data pattern:" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Hybrid caching related functions
cache_patterns=(
  "setCachedMockData"
  "getCachedMockData"
)

for pattern in "${cache_patterns[@]}"; do
  COUNT=$(grep -r $pattern --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | grep -v "mockDataCache.ts" | wc -l)
  echo "Found $COUNT occurrences of $pattern"
  
  if [ $COUNT -gt 0 ]; then
    echo "### Pattern: $pattern" >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    grep -r $pattern --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | grep -v "mockDataCache.ts" >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
  fi
done

# Hooks that should use caching but don't
echo "### Hooks potentially missing hybrid caching" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"

MISSING_CACHE_HOOKS=0
for hook in $HOOK_FILES; do
  if grep -q "useQuery" "$hook" && grep -q "supabase" "$hook" && ! grep -q "getCachedMockData" "$hook"; then
    echo "Missing cache implementation: $hook"
    echo "$hook" >> "$RESULTS_FILE"
    ((MISSING_CACHE_HOOKS++))
  fi
done

echo "\`\`\`" >> "$RESULTS_FILE"
echo "Total hooks potentially missing caching: $MISSING_CACHE_HOOKS" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# -----------------------------------------
# PART 5: Check for isValidUUID usage
# -----------------------------------------
echo "Checking for UUID validation..."
echo "## 5. UUID Validation" >> "$RESULTS_FILE"
echo "Hooks should validate UUIDs before querying Supabase:" >> "$RESULTS_FILE" 
echo "" >> "$RESULTS_FILE"

COUNT=$(grep -r "isValidUUID" --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | grep -v "id-utils.ts" | wc -l)
echo "Found $COUNT occurrences of isValidUUID"

echo "### isValidUUID usage" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"
grep -r "isValidUUID" --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | grep -v "id-utils.ts" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check hooks that use Supabase but don't validate UUIDs
echo "### Hooks potentially missing UUID validation" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"

MISSING_VALIDATION=0
for hook in $HOOK_FILES; do
  if grep -q "supabase" "$hook" && grep -q "id.*=" "$hook" && ! grep -q "isValidUUID" "$hook"; then
    echo "Missing UUID validation: $hook"
    echo "$hook" >> "$RESULTS_FILE"
    ((MISSING_VALIDATION++))
  fi
done

echo "\`\`\`" >> "$RESULTS_FILE"
echo "Total hooks potentially missing UUID validation: $MISSING_VALIDATION" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# -----------------------------------------
# PART 6: Data source tracking
# -----------------------------------------
echo "Checking for data source tracking..."
echo "## 6. Data Source Tracking" >> "$RESULTS_FILE"
echo "Components should track the data source (database, cache, mock) for debugging:" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Source tracking pattern
COUNT=$(grep -r "_source" --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | wc -l)
echo "Found $COUNT occurrences of _source tracking"

echo "### _source tracking usage" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"
grep -r "_source" --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Check hooks that might need source tracking
echo "### Hooks potentially missing source tracking" >> "$RESULTS_FILE"
echo "\`\`\`" >> "$RESULTS_FILE"

MISSING_SOURCE=0
for hook in $HOOK_FILES; do
  if grep -q "return data" "$hook" && ! grep -q "_source" "$hook"; then
    echo "Missing source tracking: $hook"
    echo "$hook" >> "$RESULTS_FILE"
    ((MISSING_SOURCE++))
  fi
done

echo "\`\`\`" >> "$RESULTS_FILE"
echo "Total hooks potentially missing source tracking: $MISSING_SOURCE" >> "$RESULTS_FILE"

# -----------------------------------------
# Summary
# -----------------------------------------
echo "" >> "$RESULTS_FILE"
echo "## Audit Summary" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "| Category | Potential Issues |" >> "$RESULTS_FILE"
echo "|----------|------------------|" >> "$RESULTS_FILE"
echo "| Non-UUID String IDs | $(grep -r "'student-[0-9]\|\"student-[0-9]\|'s-[0-9]\|\"s-[0-9]" --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | wc -l | xargs) |" >> "$RESULTS_FILE"
echo "| ID Prefix Creation | $(grep -r "createPrefixedId\|ID_PREFIXES" --include="*.ts" --include="*.tsx" $SRC_DIR | grep -v "test" | grep -v "id-utils.ts" | wc -l | xargs) |" >> "$RESULTS_FILE"
echo "| Missing UUID Imports | $MISSING_UUID_IMPORTS |" >> "$RESULTS_FILE"
echo "| Missing Hybrid Caching | $MISSING_CACHE_HOOKS |" >> "$RESULTS_FILE"
echo "| Missing UUID Validation | $MISSING_VALIDATION |" >> "$RESULTS_FILE"
echo "| Missing Source Tracking | $MISSING_SOURCE |" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

echo "Audit complete! Results saved to: $RESULTS_FILE"
echo ""
echo "Next steps:"
echo "1. Review the audit results"
echo "2. Fix the identified issues according to DATABASE_WORKFLOW.md"
echo "3. Re-run the audit to track progress" 