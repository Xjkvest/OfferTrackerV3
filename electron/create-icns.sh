#!/bin/bash

# Check if we have a source image
if [ -z "$1" ]; then
  echo "Usage: $0 <source.png>"
  exit 1
fi

# Source image
SOURCE="$1"
ICONSET="icon.iconset"

# Create iconset directory
mkdir -p "$ICONSET"

# Generate various sizes
sips -z 16 16     "$SOURCE" --out "$ICONSET/icon_16x16.png"
sips -z 32 32     "$SOURCE" --out "$ICONSET/icon_16x16@2x.png"
sips -z 32 32     "$SOURCE" --out "$ICONSET/icon_32x32.png"
sips -z 64 64     "$SOURCE" --out "$ICONSET/icon_32x32@2x.png"
sips -z 128 128   "$SOURCE" --out "$ICONSET/icon_128x128.png"
sips -z 256 256   "$SOURCE" --out "$ICONSET/icon_128x128@2x.png"
sips -z 256 256   "$SOURCE" --out "$ICONSET/icon_256x256.png"
sips -z 512 512   "$SOURCE" --out "$ICONSET/icon_256x256@2x.png"
sips -z 512 512   "$SOURCE" --out "$ICONSET/icon_512x512.png"
sips -z 1024 1024 "$SOURCE" --out "$ICONSET/icon_512x512@2x.png"

# Convert iconset to icns
iconutil -c icns "$ICONSET"

# Clean up
rm -rf "$ICONSET"

echo "Created icon.icns from $SOURCE" 