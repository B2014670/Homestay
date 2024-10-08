import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

const GG_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GG_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)
