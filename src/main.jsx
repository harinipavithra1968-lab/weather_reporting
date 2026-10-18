import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthApp from './AuthApp.jsx';
import './styles.css';
import './Auth.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AuthApp /></React.StrictMode>
);