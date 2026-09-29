import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { initializeAuth } from '@/auth/session'
import App from '@/App.tsx'
import './index.css'

initializeAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
