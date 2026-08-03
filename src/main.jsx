import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RestaurantProvider>
          <OrderProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </OrderProvider>
        </RestaurantProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
