#!/bin/bash

# Create directory for icons if it doesn't exist
mkdir -p public/icons

# Source SVG file
SOURCE_SVG="public/icons/OfferTrackerAppIconmm.svg"

# Check if the source SVG exists
if [ ! -f "$SOURCE_SVG" ]; then
  echo "Source SVG file $SOURCE_SVG not found!"
  exit 1
fi

# Generate PWA icons
echo "Generating PWA icons..."

# Standard sizes
convert -background none -density 300 "$SOURCE_SVG" -resize 192x192 public/icons/icon-192x192.png
convert -background none -density 300 "$SOURCE_SVG" -resize 512x512 public/icons/icon-512x512.png

# Apple touch icons
convert -background none -density 300 "$SOURCE_SVG" -resize 180x180 public/icons/apple-touch-icon-180x180.png
convert -background none -density 300 "$SOURCE_SVG" -resize 167x167 public/icons/apple-touch-icon-167x167.png
convert -background none -density 300 "$SOURCE_SVG" -resize 152x152 public/icons/apple-touch-icon-152x152.png
convert -background none -density 300 "$SOURCE_SVG" -resize 180x180 public/icons/apple-touch-icon.png

# Maskable icons (with padding for safe area)
convert -background none -density 300 "$SOURCE_SVG" -resize 214x214 -gravity center -background none -extent 250x250 public/icons/maskable-icon-192x192.png
convert -background none -density 300 "$SOURCE_SVG" -resize 538x538 -gravity center -background none -extent 650x650 public/icons/maskable-icon-512x512.png

# Favicon
convert -background none -density 300 "$SOURCE_SVG" -resize 32x32 public/favicon-32x32.png
convert -background none -density 300 "$SOURCE_SVG" -resize 16x16 public/favicon-16x16.png
convert -background none -density 300 "$SOURCE_SVG" -resize 48x48 public/favicon.ico

echo "Icon generation complete!" 