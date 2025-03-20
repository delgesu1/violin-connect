#!/bin/bash

echo "Starting Supabase with CORS configuration..."
cd "$(dirname "$0")"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Please install it:"
  echo "npm install -g supabase"
  exit 1
fi

# Stop any running instance
supabase stop || true

# Start Supabase with CORS configuration
supabase start

echo "Supabase is now running with CORS configuration."
echo "You can now run your application in development mode." 