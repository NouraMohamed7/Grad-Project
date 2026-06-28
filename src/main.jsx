import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from './App';

// 1. Global first (variables + reset)

import './styles/global.css';

// 2. Layout (sidebar + topbar)
import './styles/dashboard.css';

// 3. Page-specific styles
import './styles/auth.css';
import './styles/products.css';
import './styles/orders.css';
import './styles/requests.css';
import './styles/chat.css';
import './styles/chats.css';

// 4. Toastify
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);