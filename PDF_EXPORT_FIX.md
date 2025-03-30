# PDF Export Fix

## Issue

The PDF export functionality was failing with a React error #321, which occurs when React hooks are used in an invalid context.

## Root Cause

The issue was caused by using React hooks (specifically `useMemo`) in the `pdfExport.tsx` file. The PDF generation process happens outside of React's typical rendering lifecycle, which causes the hooks to fail.

## Fix

Removed all instances of React hooks in the PDF generation function, replacing them with Immediately Invoked Function Expressions (IIFEs). 

Specifically:
1. Removed imports of `useUser` and `useMemo`
2. Replaced all `useMemo` calls with IIFE pattern `(() => { ... })()` 
3. Added null/empty checks to avoid division by zero errors
4. Made sure that PDF component rendering is properly isolated from React's rendering lifecycle

## Additional Improvements

1. Added better error handling in the PDF generation process
2. Used the `file-saver` library for better browser compatibility
3. Added better error reporting to identify issues more easily in the future

## Testing

To verify that PDF export is now working properly:

1. Go to the Performance Studio tab
2. Click "Export PDF Report" 
3. Save the PDF when prompted
4. Verify the PDF opens correctly and contains all expected information

If you still encounter issues, check the browser console for additional error details. 