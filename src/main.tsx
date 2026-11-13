import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/makeAdmin.ts' // Load admin utility
import { initTelemetry } from './lib/telemetry'

// Start tracing before the first data load, but never hold the site up for
// more than a second waiting for it.
Promise.race([initTelemetry(), new Promise((r) => setTimeout(r, 1000))]).finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
