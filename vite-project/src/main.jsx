import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './routes/AppRoutes.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* checks the current URL and renders the appropriate component based on the defined routes in AppRoutes.jsx */}
    <BrowserRouter>
      {/* renders the AppRoutes component, which contains the routing logic for the application */}
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
