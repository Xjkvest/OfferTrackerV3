#!/bin/bash

# Stage all changes
git add .

# Create a commit
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
git push origin main 