import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { pages } from './templates/pages.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* actual user data would be passed in here */}
    <App initialRooms={pages.slice(0, 2)} />
  </React.StrictMode>,
)
