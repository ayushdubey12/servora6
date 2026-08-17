import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { ReservationProvider } from './context/ReservationContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RestaurantProvider>
          <OrderProvider>
            <CartProvider>
              <CustomerAuthProvider>
                <ReservationProvider>
                  <App />
                </ReservationProvider>
              </CustomerAuthProvider>
            </CartProvider>
          </OrderProvider>
        </RestaurantProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
