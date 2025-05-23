/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Electron API types
declare global {
  interface Window {
    electronAPI?: {
      savePDF: (pdfBase64: string, defaultFileName: string) => Promise<{
        success: boolean;
        filePath?: string;
        error?: string;
      }>;
    };
  }
}
