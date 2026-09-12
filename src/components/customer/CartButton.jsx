import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Icons } from '../../assets/icons';
import './CartButton.css';

export default function CartButton() {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <button className="cart-fab" onClick={() => navigate('/cart')}>
      <Icons.ShoppingCart size={24} />
      {itemCount > 0 && <span className="cart-fab-badge">{itemCount}</span>}
    </button>
  );
}
