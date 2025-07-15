import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/makeAdmin.ts' // Load admin utility

createRoot(document.getElementById("root")!).render(<App />);
