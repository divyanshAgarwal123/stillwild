import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import './photo/studio.css';
import './photo/journey.css';
import './photo/uiMotion.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
