/**
 * SERVORA API Client
 * Replaces direct Supabase calls with backend API requests.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const stored = localStorage.getItem('servora-auth');
  if (!stored) return {};
  try {
    const { token } = JSON.parse(stored);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

function customerAuthHeaders() {
  const stored = localStorage.getItem('servora-customer');
  if (!stored) return {};
  try {
    const { token } = JSON.parse(stored);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

function allHeaders() {
  // Staff token takes priority — staff operations (claim, status update) must use the staff JWT.
  // Only fall back to customer token if no staff token exists.
  const staff = authHeaders();
  const customer = customerAuthHeaders();
  return {
    'Content-Type': 'application/json',
    ...(Object.keys(staff).length > 0 ? staff : customer),
  };
}

async function api(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...allHeaders(), ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || body.message || `API error ${res.status}`);
  }

  const json = await res.json();
  // Backend wraps responses in { success, data } — unwrap for consumers
  if (json && json.success && json.data !== undefined) return json.data;
  return json;
}

// ============================================
// Auth
// ============================================

export async function registerUser({ email, password, name, restaurantName }) {
  return api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, restaurantName }),
  });
}

export async function loginUser(email, password) {
  return api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return api('/api/auth/profile');
}

export async function updateProfile(fields) {
  return api('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(fields),
  });
}

export async function registerStaff({ email, password, name, role }) {
  return api('/api/auth/register-staff', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function getStaff() {
  return api('/api/auth/staff');
}

export async function deleteStaff(id) {
  return api(`/api/auth/staff/${id}`, { method: 'DELETE' });
}

export async function getDashboardStats() {
  return api('/api/auth/dashboard-stats');
}

export async function getWaiterStats() {
  return api('/api/stats/waiters');
}

// ============================================
// Restaurants
// ============================================

export async function getRestaurants() {
  return api('/api/restaurants');
}

export async function getRestaurant(id) {
  return api(`/api/restaurants/${id}`);
}

export async function getRestaurantBySlug(slug) {
  return api(`/api/restaurants/slug/${slug}`);
}

export async function updateRestaurant(id, data) {
  return api(`/api/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// Categories
// ============================================

export async function getCategories(restaurantId) {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
  return api(`/api/categories${params}`);
}

export async function getCategoryCount(restaurantId) {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
  return api(`/api/categories/count${params}`);
}

export async function createCategory(data) {
  return api('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return api(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id) {
  return api(`/api/categories/${id}`, { method: 'DELETE' });
}

// ============================================
// Menu Items
// ============================================

export async function getMenuItems(restaurantId) {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
  return api(`/api/menu-items${params}`);
}

export async function getMenuItemCount(restaurantId) {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
  return api(`/api/menu-items/count${params}`);
}

export async function getMenuItem(id) {
  return api(`/api/menu-items/${id}`);
}

export async function createMenuItem(data) {
  return api('/api/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(id, data) {
  return api(`/api/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(id) {
  return api(`/api/menu-items/${id}`, { method: 'DELETE' });
}

// ============================================
// Tables
// ============================================

export async function getTables(restaurantId) {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
  return api(`/api/tables${params}`);
}

export async function getTableCount(restaurantId) {
  const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
  return api(`/api/tables/count${params}`);
}

export async function createTable(data) {
  return api('/api/tables', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createBulkTables(restaurantId, tables) {
  return api('/api/tables/bulk', {
    method: 'POST',
    body: JSON.stringify({ restaurantId, tables }),
  });
}

export async function updateTable(id, data) {
  return api(`/api/tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTable(id) {
  return api(`/api/tables/${id}`, { method: 'DELETE' });
}

// ============================================
// Orders
// ============================================

export async function getOrders() {
  return api('/api/orders');
}

export async function getOrder(id) {
  return api(`/api/orders/${id}`);
}

export async function createOrder(data) {
  return api('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrderStatus(id, status) {
  return api(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function claimOrder(id, waiterId) {
  return api(`/api/orders/${id}/claim`, {
    method: 'PUT',
    body: JSON.stringify({ waiterId }),
  });
}

export async function releaseOrder(id) {
  return api(`/api/orders/${id}/release`, {
    method: 'PUT',
  });
}

// ============================================
// Reservations
// ============================================

export async function getReservations() {
  return api('/api/reservations');
}

export async function createReservation(data) {
  return api('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReservationStatus(id, status) {
  return api(`/api/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function deleteReservation(id) {
  return api(`/api/reservations/${id}`, { method: 'DELETE' });
}

// ============================================
// Public (no auth required)
// ============================================

export async function getPublicMenu(slug) {
  return api(`/api/public/menu/${encodeURIComponent(slug)}`);
}

export async function getPublicMenuItem(slug, itemId) {
  return api(`/api/public/menu/${encodeURIComponent(slug)}/item/${encodeURIComponent(itemId)}`);
}

// ============================================
// Payments (Razorpay)
// ============================================

export async function createRazorpayOrder(orderId) {
  return api('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
}

export async function verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }) {
  return api('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }),
  });
}

// ============================================
// Customers
// ============================================

export async function getCustomers() {
  return api('/api/auth/customers');
}

export async function registerCustomer({ email, password, name, phone }) {
  return api('/api/auth/register-customer', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, phone }),
  });
}

// ============================================
// Feedback / Reviews
// ============================================

export async function getFeedback() {
  return api('/api/feedback');
}

export async function submitFeedback({ restaurantId, customerId, orderId, rating, comment }) {
  return api('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({ restaurantId, customerId, orderId, rating, comment }),
  });
}

export async function replyToFeedback(id, reply) {
  return api(`/api/feedback/${id}/reply`, {
    method: 'PUT',
    body: JSON.stringify({ reply }),
  });
}
