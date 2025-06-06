# Offer Tracker

A comprehensive application for tracking offers, conversions, and performance metrics.

## About

Offer Tracker is a powerful tool designed to help Customer Success teams track their offers, analyze conversion rates, and visualize performance data. The application features a clean, modern interface with robust data visualization capabilities.

## Features

- **Offer Management**: Track offers with detailed information including date, channel, case number, and notes
- **Conversion Tracking**: Monitor which offers convert successfully and analyze conversion rates
- **Data Visualization**: View performance metrics through charts and graphs
- **Analytics Dashboard**: Get insights into your performance with detailed analytics
- **Fully Offline Capable**: Works completely offline with no external dependencies
- **PDF Reporting**: Generate comprehensive PDF reports for sharing or archiving
- **Dark/Light Mode**: Choose your preferred visual theme
- **PWA Support**: Install as a Progressive Web App on desktop or mobile

## Technology Stack

This application is built with:

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **react-pdf** - PDF generation
- **Nivo** - Data visualization charts

## Getting Started

### Prerequisites

- Node.js (>= 16.x)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd offer-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:8080 (or another port if 8080 is in use).

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Offline Support

This application is designed to work completely offline. All assets, including fonts and images, are stored locally. The service worker caches resources for offline use.

## Project Structure

```
offer-tracker/
├── public/          # Static assets and PWA files
├── src/
│   ├── components/  # Reusable UI components
│   ├── context/     # React context providers
│   ├── hooks/       # Custom React hooks
│   ├── layouts/     # Page layout components
│   ├── lib/         # Helper libraries
│   ├── pages/       # App pages/routes
│   ├── utils/       # Utility functions
│   ├── App.tsx      # Main application component
│   └── main.tsx     # Application entry point
└── index.html       # HTML template
```

## Keyboard Shortcuts

Speed up your workflow with these handy shortcuts:

- `⌘ Shift N` – Create new offer
- `⌘ Shift O` – Quick log offer
- `⌘ ,` – Open preferences
- `⌘ Shift /` – Show keyboard shortcuts
- `⌘ Shift D` – Go to dashboard
- `⌘ Shift L` – Go to offers list
- `⌘ Shift A` – Go to analytics
- `⌘ Shift S` – Go to settings
- `⌘ Shift B` – Go to notifications
- `Escape` – Close dialogs

See the [Help page](/help) for the full list.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
