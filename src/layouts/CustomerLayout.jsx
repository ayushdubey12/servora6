import { Outlet, useParams } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import CartButton from '../components/customer/CartButton';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const { restaurantSlug } = useParams();
  const { restaurant } = useRestaurant();
  
  // In a real app, we'd fetch restaurant by slug here
  
  return (
    <div className="customer-layout">
      <header className="customer-header">
        <div className="container">
          <div className="customer-header-inner">
            <div className="customer-brand">
              <h1 className="customer-restaurant-name">{restaurant.name}</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="customer-main">
        <Outlet />
      </main>
      
      <CartButton />
    </div>
  );
}
