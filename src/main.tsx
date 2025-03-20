import { createRoot } from 'react-dom/client'
import { App } from '@app/index'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Debug: check if we're getting the key
console.log("Clerk Publishable Key available:", !!PUBLISHABLE_KEY);
console.log("Development mode:", DEV_MODE);

// Create a function to render the app
const renderApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  // In development mode, we still use ClerkProvider but with a mock setup
  if (DEV_MODE) {
    console.log("⚠️ Running in development mode - Using mock Clerk provider");
    
    // Using a dev publishable key or a fallback mock key
    const devKey = PUBLISHABLE_KEY || "pk_test_development_placeholder_key";
    
    // In development mode, we can bypass Clerk completely by not using ClerkProvider
    if (window.location.hostname === 'localhost') {
      console.log("🔧 Running on localhost - Bypassing Clerk provider for faster development");
      createRoot(rootElement).render(
        <App isDevelopment={true} />
      );
      return;
    }
    
    // For non-localhost development (preview deployments, etc.)
    createRoot(rootElement).render(
      <ClerkProvider publishableKey={devKey}>
        <App isDevelopment={true} />
      </ClerkProvider>
    );
    return;
  }
  
  // For production, require Clerk
  if (!PUBLISHABLE_KEY) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h2 style="color: red;">Error: Missing Clerk Publishable Key</h2>
        <p>The VITE_CLERK_PUBLISHABLE_KEY environment variable is missing. Please check your .env file.</p>
      </div>
    `;
    throw new Error("Missing Publishable Key");
  }

  createRoot(rootElement).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App isDevelopment={false} />
    </ClerkProvider>
  );
};

// Try to render the app, with error handling
try {
  renderApp();
} catch (error) {
  console.error("Error rendering app:", error);
  // Display error on page
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h2 style="color: red;">Error Rendering Application</h2>
        <p>${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
  }
}
