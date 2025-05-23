#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const VERSION_CHECK_PATH = path.join(__dirname, '..', 'src', 'hooks', 'useVersionCheck.ts');

function updateVersion(newVersion, updateInfo) {
  // Update package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');

  // Update useVersionCheck.ts
  let versionCheckContent = fs.readFileSync(VERSION_CHECK_PATH, 'utf8');
  
  // Update CURRENT_VERSION
  versionCheckContent = versionCheckContent.replace(
    /const CURRENT_VERSION = '[^']*'/,
    `const CURRENT_VERSION = '${newVersion}'`
  );

  // Add new version to VERSION_UPDATES
  const newUpdateEntry = `  '${newVersion}': ${JSON.stringify(updateInfo, null, 4).replace(/^/gm, '  ')},`;
  
  versionCheckContent = versionCheckContent.replace(
    /(const VERSION_UPDATES: Record<string, UpdateInfo> = {[^}]+)}/,
    `$1  ${newUpdateEntry.trim()}\n}`
  );

  fs.writeFileSync(VERSION_CHECK_PATH, versionCheckContent);
  
  console.log(`✅ Version updated to ${newVersion}`);
  console.log('📝 Updated files:');
  console.log('  - package.json');
  console.log('  - src/hooks/useVersionCheck.ts');
}

// Example usage
if (process.argv[2] === '--example') {
  const exampleVersion = '1.1.0';
  const exampleUpdateInfo = {
    version: exampleVersion,
    title: 'Enhanced Experience Update',
    features: [
      'New feature 1',
      'New feature 2'
    ],
    improvements: [
      'Performance improvements',
      'Better user experience'
    ],
    fixes: [
      'Fixed critical bug',
      'Resolved minor issues'
    ]
  };
  
  console.log('Example usage:');
  console.log('node scripts/update-version.js');
  console.log('\nExample update info:');
  console.log(JSON.stringify(exampleUpdateInfo, null, 2));
} else if (process.argv[2]) {
  console.log('❌ Invalid usage. Run with --example to see how to use this script.');
  console.log('To update versions, edit this script with your new version info and run it.');
} else {
  console.log('📖 To update a version:');
  console.log('1. Edit this script with your new version and update info');
  console.log('2. Run: node scripts/update-version.js');
  console.log('3. Run with --example to see the format');
}

module.exports = { updateVersion }; 