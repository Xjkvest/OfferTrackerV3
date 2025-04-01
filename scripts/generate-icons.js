// This script generates all the necessary PWA icons from the source SVG
// To run: npm install sharp && node scripts/generate-icons.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { execSync } from 'child_process';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source SVG file
const svgPath = path.join(__dirname, '../public/icons/OfferTrackerSVG.svg');

// Output directory
const iconsDir = path.join(__dirname, '../public/icons');
const publicDir = path.join(__dirname, '../public');

// Ensure the directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Define all the required icons
const icons = [
  // Regular icons
  { name: 'icon-192x192.png', size: 192, maskable: false },
  { name: 'icon-512x512.png', size: 512, maskable: false },
  
  // Maskable icons (with padding for safe area)
  { name: 'maskable-icon-192x192.png', size: 192, maskable: true },
  { name: 'maskable-icon-512x512.png', size: 512, maskable: true },
  
  // Apple touch icons
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'apple-touch-icon-152x152.png', size: 152, maskable: false },
  { name: 'apple-touch-icon-167x167.png', size: 167, maskable: false },
  { name: 'apple-touch-icon-180x180.png', size: 180, maskable: false },
];

// Also generate favicons
const favicons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-64x64.png', size: 64 },  // Extra size for favicon.ico
  { name: 'favicon-128x128.png', size: 128 }, // Extra size for favicon.ico
];

// Read the SVG file
const svgBuffer = fs.readFileSync(svgPath);

// Function to create a maskable icon (with padding for the safe zone)
async function createMaskableIcon(buffer, size, outputPath) {
  // Create a square canvas with 10% padding
  const padding = Math.floor(size * 0.1);
  const iconSize = size - (padding * 2);
  
  await sharp(buffer)
    .resize(iconSize, iconSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 35, g: 24, b: 109, alpha: 1 } // Dark blue background matching SVG
    })
    .toFile(outputPath);
  
  console.log(`Created maskable icon: ${outputPath}`);
}

// Function to create a regular icon
async function createRegularIcon(buffer, size, outputPath) {
  await sharp(buffer)
    .resize(size, size)
    .toFile(outputPath);
  
  console.log(`Created icon: ${outputPath}`);
}

// Generate favicon.ico file with multiple sizes
async function generateFaviconIco() {
  try {
    // Check if ImageMagick is installed
    try {
      execSync('which convert', { stdio: 'ignore' });
      
      // Generate all favicon PNG files first
      const faviconPaths = [];
      for (const favicon of favicons) {
        const outputPath = path.join(publicDir, favicon.name);
        await createRegularIcon(svgBuffer, favicon.size, outputPath);
        faviconPaths.push(outputPath);
      }
      
      // Use ImageMagick to combine them into a multi-size favicon.ico
      const icoPath = path.join(publicDir, 'favicon.ico');
      execSync(`convert ${faviconPaths.join(' ')} ${icoPath}`);
      console.log(`Created multi-size favicon: ${icoPath}`);
      
      // Clean up temporary favicon files (except the 16x16 and 32x32 which are used by the manifest)
      fs.unlinkSync(path.join(publicDir, 'favicon-64x64.png'));
      fs.unlinkSync(path.join(publicDir, 'favicon-128x128.png'));
    } catch (error) {
      console.warn('ImageMagick not found, skipping favicon.ico generation');
      console.warn('Only generating individual favicon PNG files');
      
      // Generate the basic favicon PNG files
      for (const favicon of favicons.slice(0, 2)) { // Only generate 16x16 and 32x32
        const outputPath = path.join(publicDir, favicon.name);
        await createRegularIcon(svgBuffer, favicon.size, outputPath);
      }
    }
  } catch (error) {
    console.error('Error generating favicon.ico:', error);
  }
}

// Generate all icons
async function generateIcons() {
  try {
    // Generate main icons
    for (const icon of icons) {
      const outputPath = path.join(iconsDir, icon.name);
      
      if (icon.maskable) {
        await createMaskableIcon(svgBuffer, icon.size, outputPath);
      } else {
        await createRegularIcon(svgBuffer, icon.size, outputPath);
      }
    }
    
    // Generate favicon files
    await generateFaviconIco();
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the icon generation
generateIcons(); 