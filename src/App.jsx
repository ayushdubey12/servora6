import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import CustomerLayout from './layouts/CustomerLayout';
import KitchenLayout from './layouts/KitchenLayout';
import StaffLayout from './layouts/StaffLayout';
import OnboardingLayout from './layouts/OnboardingLayout';

// Public Pages
import Home from './pages/public/Home';
import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Onboarding
import OnboardingStart from './pages/onboarding/OnboardingStart';
import RestaurantSetup from './pages/onboarding/RestaurantSetup';
import BranchSetup from './pages/onboarding/BranchSetup';
import TableSetup from './pages/onboarding/TableSetup';
import MenuSetup from './pages/onboarding/MenuSetup';
import PaymentSetup from './pages/onboarding/PaymentSetup';
import WaiterSetup from './pages/onboarding/WaiterSetup';
import Complete from './pages/onboarding/Complete';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import Orders from './pages/dashboard/Orders';
import Menu from './pages/dashboard/Menu';
import Categories from './pages/dashboard/Categories';
import Tables from './pages/dashboard/Tables';
import QRCodes from './pages/dashboard/QRCodes';
import Customers from './pages/dashboard/Customers';
import Staff from './pages/dashboard/Staff';
import KitchenView from './pages/dashboard/KitchenView';
import Payments from './pages/dashboard/Payments';
import Analytics from './pages/dashboard/Analytics';
import Reviews from './pages/dashboard/Reviews';
import Offers from './pages/dashboard/Offers';
import Settings from './pages/dashboard/Settings';

// Customer
import MenuPage from './pages/customer/MenuPage';
import ItemDetail from './pages/customer/ItemDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import Feedback from './pages/customer/Feedback';
import Reserve from './pages/customer/Reserve';
import Account from './pages/customer/Account';
import Payment from './pages/customer/Payment';

// Kitchen
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import KitchenOrders from './pages/kitchen/KitchenOrders';

// Dashboard
import Reservations from './pages/dashboard/Reservations';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrders from './pages/staff/StaffOrders';
import StaffTables from './pages/staff/StaffTables';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Onboarding Routes */}
      <Route path="/onboarding" element={<ProtectedRoute roles={['owner']}><OnboardingLayout /></ProtectedRoute>}>
        <Route index element={<OnboardingStart />} />
        <Route path="restaurant" element={<RestaurantSetup />} />
        <Route path="branch" element={<BranchSetup />} />
        <Route path="tables" element={<TableSetup />} />
        <Route path="menu" element={<MenuSetup />} />
        <Route path="payments" element={<PaymentSetup />} />
        <Route path="waiters" element={<WaiterSetup />} />
        <Route path="complete" element={<Complete />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['owner']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<Menu />} />
        <Route path="categories" element={<Categories />} />
        <Route path="tables" element={<Tables />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="qr" element={<QRCodes />} />
        <Route path="customers" element={<Customers />} />
        <Route path="staff" element={<Staff />} />
        <Route path="kitchen" element={<KitchenView />} />
        <Route path="payments" element={<Payments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="offers" element={<Offers />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Customer Routes */}
      <Route path="/menu/:restaurantSlug" element={<CustomerLayout />}>
        <Route index element={<MenuPage />} />
        <Route path="item/:itemId" element={<ItemDetail />} />
      </Route>
      <Route path="/cart" element={<CustomerLayout />}>
        <Route index element={<Cart />} />
      </Route>
      <Route path="/checkout" element={<CustomerLayout />}>
        <Route index element={<Checkout />} />
      </Route>
      <Route path="/order/:orderId" element={<CustomerLayout />}>
        <Route index element={<OrderTracking />} />
      </Route>
      <Route path="/feedback" element={<CustomerLayout />}>
        <Route index element={<Feedback />} />
      </Route>
      <Route path="/reserve" element={<CustomerLayout />}>
        <Route index element={<Reserve />} />
      </Route>
      <Route path="/account" element={<CustomerLayout />}>
        <Route index element={<Account />} />
      </Route>
      <Route path="/payment/:orderId" element={<CustomerLayout />}>
        <Route index element={<Payment />} />
      </Route>

      {/* Kitchen Routes */}
      <Route path="/kitchen" element={<ProtectedRoute roles={['owner', 'chef']}><KitchenLayout /></ProtectedRoute>}>
        <Route index element={<KitchenDashboard />} />
        <Route path="orders" element={<KitchenOrders />} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={<ProtectedRoute roles={['owner', 'waiter']}><StaffLayout /></ProtectedRoute>}>
        <Route index element={<StaffDashboard />} />
        <Route path="orders" element={<StaffOrders />} />
        <Route path="tables" element={<StaffTables />} />
      </Route>
    </Routes>
  );
}
