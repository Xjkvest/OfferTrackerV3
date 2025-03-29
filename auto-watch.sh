#!/bin/bash

echo "Starting auto-push watcher..."
echo "Watching for changes in $(pwd)"
echo "Press Ctrl+C to stop"

fswatch -o . | while read f; do
    echo "Change detected, pushing to GitHub..."
    git add .
    git commit -m "Auto-commit: $(date)"
    git push origin main
    echo "Changes pushed successfully!"
done 