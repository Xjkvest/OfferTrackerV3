#!/bin/bash

# Enable error handling
set -e

# Get the current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "Starting auto-push process..."

# Configure Git to use the macOS keychain
git config --global credential.helper osxkeychain

# Stage all changes
echo "Staging changes..."
git add .

# Check if there are any changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit"
    exit 0
fi

# Create a commit with the staged changes
echo "Creating commit..."
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"

# Try to push
echo "Pushing to remote..."
git push origin main

echo "Auto-push completed successfully!" 