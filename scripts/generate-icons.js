// This script generates all the necessary PWA icons from the source SVG
// To run: npm install sharp && node scripts/generate-icons.js

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to import sharp
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.error('Error: sharp package is not installed. Please run: npm install sharp');
  process.exit(1);
}

const SOURCE_SVG = path.join(__dirname, '../public/icons/OfferTrackerAppIconmm.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Ensure the icons directory exists
try {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
} catch (err) {
  if (err.code !== 'EEXIST') {
    console.error(`Error creating directory: ${err.message}`);
  }
}

// Function to generate an icon
async function generateIcon(size, outputPath, options = {}) {
  console.log(`Generating ${outputPath}...`);
  
  try {
    let pipeline = sharp(SOURCE_SVG);
    
    // Set resize options
    pipeline = pipeline.resize(size, size, { 
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
    
    // Add padding for maskable icons if needed
    if (options.maskable) {
      const padding = Math.floor(size * 0.1); // 10% padding
      const actualSize = size - (padding * 2); 
      
      pipeline = sharp(SOURCE_SVG)
        .resize(actualSize, actualSize, { 
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });
    }
    
    // Output the PNG file
    await pipeline.toFile(outputPath);
  } catch (error) {
    console.error(`Error generating ${outputPath}:`, error);
  }
}

// Main function to generate all icons
async function generateIcons() {
  try {
    // Standard PWA icons
    await generateIcon(192, path.join(OUTPUT_DIR, 'icon-192x192.png'));
    await generateIcon(512, path.join(OUTPUT_DIR, 'icon-512x512.png'));
    
    // Apple touch icons
    await generateIcon(180, path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
    await generateIcon(152, path.join(OUTPUT_DIR, 'apple-touch-icon-152x152.png'));
    await generateIcon(167, path.join(OUTPUT_DIR, 'apple-touch-icon-167x167.png'));
    await generateIcon(180, path.join(OUTPUT_DIR, 'apple-touch-icon-180x180.png'));
    
    // Maskable icons
    await generateIcon(192, path.join(OUTPUT_DIR, 'maskable-icon-192x192.png'), { maskable: true });
    await generateIcon(512, path.join(OUTPUT_DIR, 'maskable-icon-512x512.png'), { maskable: true });
    
    // Favicons
    await generateIcon(32, path.join(PUBLIC_DIR, 'favicon-32x32.png'));
    await generateIcon(16, path.join(PUBLIC_DIR, 'favicon-16x16.png'));
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the script
generateIcons(); 