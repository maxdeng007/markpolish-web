/** @jsxImportSource react */
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Disabled StrictMode to prevent "insertBefore" errors with complex HTML rendering
  <App />
)
