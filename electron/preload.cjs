// Use CommonJS require instead of ES module imports for better compatibility
const { ipcRenderer, contextBridge } = require('electron');

// Flag for react-pdf-renderer
window.REACT_PDF_BROWSER = true;

console.log('Preload script executing...');

// Test if IPC is available
console.log('IPC renderer available:', !!ipcRenderer);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  savePDF: async (pdfBase64, defaultFileName) => {
    console.log('preload.js: savePDF called', {
      base64Length: pdfBase64 ? pdfBase64.length : 0,
      defaultFileName
    });
    
    try {
      const result = await ipcRenderer.invoke('save-pdf', { pdfBase64, defaultFileName });
      console.log('preload.js: savePDF result', result);
      return result;
    } catch (error) {
      console.error('preload.js: savePDF error', error);
      return { success: false, error: error.message || 'Unknown error in IPC call' };
    }
  }
});

// Use old-style DOM content loaded event handler
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded, setting up version info');
  
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
}); 