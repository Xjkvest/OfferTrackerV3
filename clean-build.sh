#!/bin/bash

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf dist release

# Remove extended attributes that cause problems with code signing
echo "Removing extended attributes from project files..."
xattr -cr .

# Build the app
echo "Building the application..."
npm run electron:build

echo "Build completed. Check the 'release' folder for your application." 