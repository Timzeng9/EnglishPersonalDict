import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

function Root() {

  return (
    <React.StrictMode>
      <BrowserRouter basename={'/EnglishPersonalDict'}>
          <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)
