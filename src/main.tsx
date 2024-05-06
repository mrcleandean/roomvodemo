import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import RoomsContextProvider from './components/RoomsContext.tsx'
import { Toaster } from './components/ui/Toaster.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* actual user data would be passed in here */}
    <RoomsContextProvider>
      <App />
      <Toaster />
    </RoomsContextProvider>
  </React.StrictMode>,
)
