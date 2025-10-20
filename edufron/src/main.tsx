// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';         // Public & student routes
import AdminApp from './AdminApp'; // Admin routes

// Entry point for the main app (public/student)
const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: separate root element for admin
const adminRootEl = document.getElementById('admin-root');
if (adminRootEl) {
  const adminRoot = createRoot(adminRootEl);
  adminRoot.render(
    <React.StrictMode>
      <AdminApp />
    </React.StrictMode>
  );
}
