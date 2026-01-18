// --- START OF FILE src/main.jsx (CLEANED) ---

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
// HelmetProvider yahan se hata diya gaya hai

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <AuthProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </AuthProvider>
  </React.StrictMode>,
);