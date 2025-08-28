// Debug script to help identify client-side errors
// Add this to your browser console to catch and log errors

console.log('🔍 Debug script loaded - monitoring for errors...');

// Override console.error to catch all errors
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 Console Error Caught:', args);
  originalError.apply(console, args);
};

// Global error handler
window.addEventListener('error', (event) => {
  console.log('🚨 Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.log('🚨 Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise
  });
});

// React error boundary simulation
const originalComponentDidCatch = React.Component.prototype.componentDidCatch;
if (originalComponentDidCatch) {
  React.Component.prototype.componentDidCatch = function(error, errorInfo) {
    console.log('🚨 React Component Error:', { error, errorInfo });
    if (originalComponentDidCatch) {
      originalComponentDidCatch.call(this, error, errorInfo);
    }
  };
}

// Monitor fetch errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args)
    .then(response => {
      if (!response.ok) {
        console.log('🚨 Fetch Error:', {
          url: args[0],
          status: response.status,
          statusText: response.statusText
        });
      }
      return response;
    })
    .catch(error => {
      console.log('🚨 Fetch Network Error:', {
        url: args[0],
        error: error.message
      });
      throw error;
    });
};

console.log('✅ Debug monitoring active. Check console for any errors.');