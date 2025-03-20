#!/bin/bash

# UUID Validation Project - Data Layer Audit Script
# This script scans the codebase for potential UUID validation issues
# and generates a report to help prioritize fixes.

# Set your project directory
PROJECT_DIR="$(pwd)"
SRC_DIR="$PROJECT_DIR/src"

# ANSI color codes for output formatting
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Output file
REPORT_FILE="$PROJECT_DIR/uuid-validation-audit-report.md"

echo "# UUID Validation Audit Report" > $REPORT_FILE
echo "Generated on $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to check for a specific pattern and append results to the report
check_pattern() {
  local pattern=$1
  local description=$2
  local severity=$3
  local count=0
  
  echo -e "${BLUE}Checking for $description...${NC}"
  
  # Find occurrences
  local results=$(grep -r --include="*.ts" --include="*.tsx" "$pattern" $SRC_DIR)
  local count=$(echo "$results" | grep -v "^$" | wc -l)
  
  # Group by file
  local files_affected=$(echo "$results" | grep -v "^$" | cut -d: -f1 | sort | uniq | wc -l)
  
  # Print to terminal
  if [ $count -gt 0 ]; then
    echo -e "${YELLOW}Found $count occurrences in $files_affected files${NC}"
  else
    echo -e "${GREEN}No issues found${NC}"
  fi
  
  # Add to report
  echo "## $description" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  
  if [ "$severity" = "high" ]; then
    echo "**Severity: HIGH**" >> $REPORT_FILE
  elif [ "$severity" = "medium" ]; then
    echo "**Severity: MEDIUM**" >> $REPORT_FILE
  else
    echo "**Severity: LOW**" >> $REPORT_FILE
  fi
  
  echo "" >> $REPORT_FILE
  echo "Found $count occurrences in $files_affected files." >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  
  if [ $count -gt 0 ]; then
    echo "### Files with issues:" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo "$results" | grep -v "^$" | cut -d: -f1 | sort | uniq | while read -r file; do
      local file_count=$(echo "$results" | grep -v "^$" | grep -c "$file")
      echo "- $file ($file_count occurrences)" >> $REPORT_FILE
    done
    echo "" >> $REPORT_FILE
    
    echo "### Sample occurrences:" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    echo '```' >> $REPORT_FILE
    echo "$results" | grep -v "^$" | head -5 >> $REPORT_FILE
    echo '```' >> $REPORT_FILE
    echo "" >> $REPORT_FILE
  fi
  
  return $count
}

# Function to check for missing imports
check_missing_import() {
  local import_pattern=$1
  local file_pattern=$2
  local description=$3
  local severity=$4
  local count=0
  
  echo -e "${BLUE}Checking for $description...${NC}"
  
  # Find files matching the pattern
  local matching_files=$(find $SRC_DIR -type f -name "$file_pattern" | xargs grep -l "from '@tanstack/react-query'" | sort)
  local matching_count=$(echo "$matching_files" | grep -v "^$" | wc -l)
  
  # Count files missing the import
  local missing_import_files=()
  local missing_count=0
  
  echo "$matching_files" | while read -r file; do
    if [ ! -z "$file" ] && ! grep -q "$import_pattern" "$file"; then
      missing_import_files+=("$file")
      missing_count=$((missing_count + 1))
    fi
  done
  
  # Print to terminal
  if [ $missing_count -gt 0 ]; then
    echo -e "${YELLOW}Found $missing_count out of $matching_count files missing the import${NC}"
  else
    echo -e "${GREEN}No issues found${NC}"
  fi
  
  # Add to report
  echo "## $description" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  
  if [ "$severity" = "high" ]; then
    echo "**Severity: HIGH**" >> $REPORT_FILE
  elif [ "$severity" = "medium" ]; then
    echo "**Severity: MEDIUM**" >> $REPORT_FILE
  else
    echo "**Severity: LOW**" >> $REPORT_FILE
  fi
  
  echo "" >> $REPORT_FILE
  echo "Found $missing_count out of $matching_count files missing the import." >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  
  if [ $missing_count -gt 0 ]; then
    echo "### Files missing the import:" >> $REPORT_FILE
    echo "" >> $REPORT_FILE
    for file in "${missing_import_files[@]}"; do
      echo "- $file" >> $REPORT_FILE
    done
    echo "" >> $REPORT_FILE
  fi
  
  return $missing_count
}

echo -e "${YELLOW}==============================================${NC}"
echo -e "${YELLOW}UUID VALIDATION PROJECT - DATA LAYER AUDIT${NC}"
echo -e "${YELLOW}==============================================${NC}"
echo ""

# Introduction to the report
cat << EOF >> $REPORT_FILE
## Introduction

This report identifies potential issues related to UUID validation in the codebase. The audit checks for:

1. Non-UUID string IDs
2. Usage of ID prefixes (e.g., "s-" for students)
3. Missing UUID validation in database operations
4. Missing imports of key utilities
5. Inconsistent development mode handling
6. Missing source tracking

Each issue is categorized by severity (HIGH, MEDIUM, LOW) to help prioritize fixes.

## Summary

EOF

# Perform all checks
echo -e "${PURPLE}Analyzing ID formats and patterns...${NC}"
echo ""

# 1. Check for string-based ID patterns instead of UUIDs
check_pattern "ID_PREFIXES\." "ID_PREFIX usage" "high"
id_prefixes_count=$?

check_pattern "createPrefixedId" "createPrefixedId usage" "high" 
prefix_id_count=$?

check_pattern "\"s-[0-9]" "Student ID string format (s-N)" "high"
student_id_string_count=$?

check_pattern "\"p-[0-9]" "Piece ID string format (p-N)" "high"
piece_id_string_count=$?

check_pattern "\"l-[0-9]" "Lesson ID string format (l-N)" "high"
lesson_id_string_count=$?

# 2. Check for consistent development mode handling
check_pattern "DEV_UUID\s*=" "Hard-coded DEV_UUID definitions" "medium"
dev_uuid_count=$?

check_pattern "isDev\s*\?" "Development mode conditional checks" "low"
is_dev_count=$?

# 3. Check for missing validation
echo ""
echo -e "${PURPLE}Analyzing database operations...${NC}"
echo ""

check_pattern "\.eq\('id'" "Database ID equality operations" "medium"
db_id_eq_count=$?

check_pattern "isValidUUID" "UUID validation checks" "high"
uuid_validation_count=$?

check_pattern "\.eq\('student_id'" "Student ID database operations" "medium"
student_id_db_count=$?

check_pattern "\.eq\('teacher_id'" "Teacher ID database operations" "medium"
teacher_id_db_count=$?

# 4. Check for missing imports
echo ""
echo -e "${PURPLE}Analyzing imports and dependencies...${NC}"
echo ""

check_missing_import "import.*isValidUUID" "*.ts" "Missing isValidUUID import in hooks" "high"
missing_validation_import_count=$?

check_missing_import "import.*from '@/lib/dev-uuids'" "use*.ts" "Missing dev-uuids import in hooks" "medium"
missing_dev_uuids_import_count=$?

check_missing_import "_source:" "use*.ts" "Missing source tracking in hooks" "medium"
missing_source_tracking_count=$?

# 5. Check for direct Clerk imports that should use the wrapper
echo ""
echo -e "${PURPLE}Analyzing authentication patterns...${NC}"
echo ""

check_pattern "import.*useAuth.*from '@clerk/clerk-react'" "Direct Clerk useAuth imports" "high"
direct_clerk_imports_count=$?

# Summary statistics
total_issues=$((id_prefixes_count + prefix_id_count + student_id_string_count + piece_id_string_count + lesson_id_string_count + dev_uuid_count + is_dev_count + db_id_eq_count - uuid_validation_count + student_id_db_count + teacher_id_db_count + missing_validation_import_count + missing_dev_uuids_import_count + missing_source_tracking_count + direct_clerk_imports_count))

echo ""
echo -e "${PURPLE}Generating summary...${NC}"
echo ""

# Add summary statistics to the report
cat << EOF >> $REPORT_FILE
- **Total potential issues identified**: $total_issues
- **ID prefix usage**: $id_prefixes_count occurrences
- **String IDs instead of UUIDs**: $((student_id_string_count + piece_id_string_count + lesson_id_string_count)) occurrences
  - Student IDs: $student_id_string_count
  - Piece IDs: $piece_id_string_count
  - Lesson IDs: $lesson_id_string_count
- **Hard-coded DEV_UUID definitions**: $dev_uuid_count occurrences
- **Database ID operations**: $db_id_eq_count occurrences
- **UUID validation checks**: $uuid_validation_count occurrences
- **Missing validation imports**: $missing_validation_import_count hooks
- **Missing dev-uuids imports**: $missing_dev_uuids_import_count hooks
- **Missing source tracking**: $missing_source_tracking_count hooks
- **Direct Clerk useAuth imports**: $direct_clerk_imports_count occurrences

## Next Steps

1. Start with hooks that have the most database operations
2. Prioritize components with string IDs that interact with the database
3. Update all hard-coded DEV_UUID references to use the central definition
4. Add UUID validation to all ID parameters in hooks
5. Implement source tracking consistently across all data-fetching hooks

For implementation guidance, refer to the UUID_VALIDATION_GUIDE.md document.
EOF

echo -e "${GREEN}Audit completed!${NC}"
echo -e "${GREEN}Report generated at:${NC} $REPORT_FILE"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the report to identify priority areas"
echo "2. Start updating high-priority components"
echo "3. Re-run this script after making changes to track progress"
echo "" 