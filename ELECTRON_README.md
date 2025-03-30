# Building the Offer Tracker as a macOS App

This guide explains how to build the Offer Tracker as a standalone macOS application using Electron.

## Prerequisites

- Node.js and npm installed
- macOS for building macOS applications
- An icon file (PNG) to use for the application

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create an application icon:
   - Save a square PNG image (at least 1024x1024px) as `app_icon.png` in the project root
   - Run the icon conversion script:
     ```bash
     ./electron/create-icns.sh app_icon.png
     ```
   - Move the generated icon.icns file to the public folder:
     ```bash
     mv icon.icns public/
     ```

## Development

To run the app in development mode:

```bash
npm run electron:dev
```

This will start both the Vite dev server and Electron app simultaneously.

## Building for Production

To build the app for macOS:

```bash
npm run electron:build
```

This will:
1. Build the React application using Vite
2. Package it into a standalone macOS application (DMG)

The output will be in the `release` folder.

## Troubleshooting

- If you encounter Node.js version conflicts, consider using nvm to switch between Node versions
- For signing and notarization for distribution outside the App Store, see the [Electron Builder documentation](https://www.electron.build/code-signing) 