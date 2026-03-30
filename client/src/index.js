import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1d',
            color: '#f0f0f2',
            border: '1px solid #2e2e33',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#2ecc71', secondary: '#1a1a1d' } },
          error:   { iconTheme: { primary: '#e63946', secondary: '#1a1a1d' } },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
