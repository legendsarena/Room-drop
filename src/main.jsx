import React from 'react';
import { createRoot } from 'react-dom/client';
import RoomDropApp from './RoomDropApp.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RoomDropApp />
  </React.StrictMode>
);
