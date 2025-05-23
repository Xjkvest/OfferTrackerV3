# Update Notification System

This system automatically shows users what's new when the app is updated, but only once per version.

## How It Works

1. **Version Tracking**: The app stores the last seen version in localStorage
2. **Automatic Detection**: On app startup, it compares the current version with the stored version
3. **One-Time Display**: If versions differ, it shows a "What's New" dialog once
4. **Elegant UI**: Beautiful dialog with categorized features, improvements, and fixes

## Components

### `useVersionCheck` Hook
Located in `src/hooks/useVersionCheck.ts`
- Manages version comparison logic
- Stores/retrieves last seen version from localStorage
- Provides state for showing/hiding the update dialog

### `WhatsNewDialog` Component
Located in `src/components/WhatsNewDialog.tsx`
- Beautiful modal dialog displaying update information
- Categorizes changes into Features, Improvements, and Bug Fixes
- Responsive design with proper scrolling for long changelogs

### Integration
The system is integrated into `App.tsx` through the `AppManager` component, ensuring it runs after all providers are loaded.

## Adding New Version Updates

### Method 1: Manual (Quick)
1. Update the version in `package.json`
2. Update `CURRENT_VERSION` in `src/hooks/useVersionCheck.ts`
3. Add new entry to `VERSION_UPDATES` object with your changelog

### Method 2: Using the Script (Recommended)
1. Edit `scripts/update-version.cjs` with your version info
2. Run the script to automatically update both files
3. Or use `npm run version:help` to see examples

### Example Version Entry
```typescript
'1.1.0': {
  version: '1.1.0',
  title: 'Enhanced Experience Update',
  features: [
    'New dashboard widgets',
    'Advanced filtering options',
    'Export to multiple formats'
  ],
  improvements: [
    'Faster loading times',
    'Better error handling',
    'Improved accessibility'
  ],
  fixes: [
    'Fixed calendar date picker bug',
    'Resolved export formatting issues',
    'Fixed responsive layout problems'
  ]
}
```

## Features

✅ **One-time display per update**  
✅ **Beautiful, categorized changelog**  
✅ **Responsive design**  
✅ **Automatic version detection**  
✅ **Easy to maintain**  
✅ **No external dependencies**  
✅ **PWA & Electron support**  
✅ **Service Worker integration**  
✅ **Automatic PWA refresh**  

## Storage

The system uses `localStorage` with the key `'offer-tracker-last-seen-version'` to track which version the user has last seen.

## Testing

To test the update notification:
1. Clear localStorage or change the stored version
2. Restart the app
3. The dialog should appear automatically

## Customization

You can customize:
- **Dialog appearance**: Edit `WhatsNewDialog.tsx`
- **Version format**: Modify the version comparison logic in `useVersionCheck.ts`
- **Storage method**: Change from localStorage to another storage mechanism
- **Timing**: Adjust the delay before checking for updates (currently 1 second)

## PWA Support

The system includes enhanced PWA support:

### PWA-Specific Features
- **Auto-detection**: Automatically detects if running as PWA
- **Service Worker Integration**: Listens for service worker updates
- **Dual Update Types**: Handles both code version changes and SW updates
- **Refresh Mechanism**: Provides smooth app refresh for PWA updates

### PWA Components
- `usePWAVersionCheck`: Enhanced hook with SW integration
- `PWAWhatsNewDialog`: Adaptive dialog for different update types

## Future Enhancements

Potential improvements:
- Online changelog fetching
- Version comparison with semantic versioning
- User preferences for notification frequency
- Update download integration (for auto-updater)
- Analytics on update adoption rates
- Background app refresh scheduling
- Offline update queuing 