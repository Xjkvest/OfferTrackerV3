#!/bin/bash
echo "Auto-committing and pushing changes..."
git add .
git commit -m "Auto-commit: $(date)"
git push origin main
echo "Done!"
