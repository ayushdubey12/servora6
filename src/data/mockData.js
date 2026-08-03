/* ============================================
   SERVORA — Mock Data
   Comprehensive data for all entities
   ============================================ */

export const restaurant = {
  id: 'rest_001',
  name: 'The Green Table',
  slug: 'the-green-table',
  cuisine: 'Modern European',
  description: 'A farm-to-table dining experience with locally sourced ingredients and seasonal menus.',
  logo: null,
  phone: '+1 (555) 123-4567',
  email: 'hello@thegreentable.com',
  website: 'https://thegreentable.com',
  address: '42 Garden Street, San Francisco, CA 94102',
  rating: 4.7,
  reviewCount: 328,
  openingHours: {
    mon: { open: '11:00', close: '22:00' },
    tue: { open: '11:00', close: '22:00' },
    wed: { open: '11:00', close: '22:00' },
    thu: { open: '11:00', close: '23:00' },
    fri: { open: '11:00', close: '23:00' },
    sat: { open: '10:00', close: '23:00' },
    sun: { open: '10:00', close: '21:00' },
  },
};

export const branches = [
  { id: 'branch_001', name: 'Downtown', address: '42 Garden Street, SF', tables: 18, status: 'active' },
  { id: 'branch_002', name: 'Marina District', address: '156 Marina Blvd, SF', tables: 12, status: 'active' },
  { id: 'branch_003', name: 'Palo Alto', address: '88 University Ave, PA', tables: 15, status: 'coming_soon' },
];

export const categories = [
  { id: 'cat_001', name: 'Starters', slug: 'starters', itemCount: 6, order: 1 },
  { id: 'cat_002', name: 'Salads', slug: 'salads', itemCount: 4, order: 2 },
  { id: 'cat_003', name: 'Mains', slug: 'mains', itemCount: 8, order: 3 },
  { id: 'cat_004', name: 'Pasta', slug: 'pasta', itemCount: 5, order: 4 },
  { id: 'cat_005', name: 'Seafood', slug: 'seafood', itemCount: 4, order: 5 },
  { id: 'cat_006', name: 'Desserts', slug: 'desserts', itemCount: 5, order: 6 },
  { id: 'cat_007', name: 'Beverages', slug: 'beverages', itemCount: 8, order: 7 },
  { id: 'cat_008', name: 'Cocktails', slug: 'cocktails', itemCount: 6, order: 8 },
];

export const menuItems = [
  // Starters
  { id: 'item_001', name: 'Truffle Burrata', description: 'Fresh burrata with black truffle, heirloom tomatoes, and aged balsamic reduction', price: 18.00, category: 'cat_001', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 10, calories: 320 },
  { id: 'item_002', name: 'Crispy Calamari', description: 'Lightly battered calamari with lemon aioli and marinara dipping sauce', price: 15.00, category: 'cat_001', image: null, isVeg: false, isPopular: true, isAvailable: true, prepTime: 12, calories: 410 },
  { id: 'item_003', name: 'Soup of the Day', description: 'Chef\'s seasonal soup served with artisan sourdough bread', price: 12.00, category: 'cat_001', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 5, calories: 220 },
  { id: 'item_004', name: 'Beef Tartare', description: 'Hand-cut prime beef with capers, cornichons, and quail egg', price: 22.00, category: 'cat_001', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 15, calories: 280 },
  { id: 'item_005', name: 'Bruschetta Trio', description: 'Three artisan bruschettas: tomato basil, mushroom truffle, and ricotta honey', price: 14.00, category: 'cat_001', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 8, calories: 350 },
  { id: 'item_006', name: 'Shrimp Cocktail', description: 'Jumbo shrimp with cocktail sauce and fresh lemon', price: 19.00, category: 'cat_001', image: null, isVeg: false, isPopular: false, isAvailable: false, prepTime: 8, calories: 190 },

  // Salads
  { id: 'item_007', name: 'Caesar Salad', description: 'Romaine hearts, parmesan crisps, house-made dressing, and garlic croutons', price: 14.00, category: 'cat_002', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 8, calories: 280 },
  { id: 'item_008', name: 'Grilled Halloumi Salad', description: 'Grilled halloumi with mixed greens, pomegranate, and mint vinaigrette', price: 16.00, category: 'cat_002', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 10, calories: 340 },
  { id: 'item_009', name: 'Niçoise Salad', description: 'Seared tuna, green beans, olives, egg, and anchovy dressing', price: 18.00, category: 'cat_002', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 12, calories: 390 },
  { id: 'item_010', name: 'Quinoa Bowl', description: 'Superfood bowl with roasted vegetables, avocado, and tahini dressing', price: 15.00, category: 'cat_002', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 10, calories: 410 },

  // Mains
  { id: 'item_011', name: 'Grilled Ribeye Steak', description: '12oz prime ribeye with roasted garlic butter, truffle fries, and seasonal vegetables', price: 42.00, category: 'cat_003', image: null, isVeg: false, isPopular: true, isAvailable: true, prepTime: 25, calories: 780 },
  { id: 'item_012', name: 'Pan-Seared Salmon', description: 'Atlantic salmon with asparagus, lemon caper sauce, and herb risotto', price: 32.00, category: 'cat_003', image: null, isVeg: false, isPopular: true, isAvailable: true, prepTime: 20, calories: 520 },
  { id: 'item_013', name: 'Herb-Crusted Lamb', description: 'New Zealand lamb rack with rosemary jus and dauphinoise potatoes', price: 38.00, category: 'cat_003', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 30, calories: 650 },
  { id: 'item_014', name: 'Wild Mushroom Risotto', description: 'Arborio rice with porcini, shiitake, and truffle oil, topped with parmesan', price: 24.00, category: 'cat_003', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 20, calories: 480 },
  { id: 'item_015', name: 'Chicken Supreme', description: 'Free-range chicken breast with morel cream sauce and gratin dauphinois', price: 28.00, category: 'cat_003', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 22, calories: 560 },
  { id: 'item_016', name: 'Duck Confit', description: 'Slow-cooked duck leg with cherry gastrique and roasted root vegetables', price: 34.00, category: 'cat_003', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 25, calories: 620 },
  { id: 'item_017', name: 'Eggplant Parmesan', description: 'Layers of grilled eggplant with San Marzano tomato sauce and mozzarella', price: 22.00, category: 'cat_003', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 18, calories: 440 },
  { id: 'item_018', name: 'Wagyu Burger', description: '8oz Wagyu patty with aged cheddar, caramelized onions, and truffle aioli', price: 26.00, category: 'cat_003', image: null, isVeg: false, isPopular: true, isAvailable: true, prepTime: 18, calories: 720 },

  // Pasta
  { id: 'item_019', name: 'Truffle Linguine', description: 'Fresh linguine with black truffle cream sauce and aged parmesan', price: 26.00, category: 'cat_004', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 15, calories: 520 },
  { id: 'item_020', name: 'Lobster Ravioli', description: 'Hand-made ravioli filled with lobster in a saffron bisque', price: 32.00, category: 'cat_004', image: null, isVeg: false, isPopular: true, isAvailable: true, prepTime: 18, calories: 480 },
  { id: 'item_021', name: 'Spaghetti Carbonara', description: 'Classic carbonara with guanciale, pecorino romano, and black pepper', price: 20.00, category: 'cat_004', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 14, calories: 580 },
  { id: 'item_022', name: 'Pappardelle Bolognese', description: 'Slow-simmered beef ragu with fresh pappardelle and pecorino', price: 22.00, category: 'cat_004', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 15, calories: 560 },
  { id: 'item_023', name: 'Pesto Gnocchi', description: 'Pillowy potato gnocchi with basil pesto, pine nuts, and cherry tomatoes', price: 19.00, category: 'cat_004', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 12, calories: 460 },

  // Seafood
  { id: 'item_024', name: 'Grilled Octopus', description: 'Tender octopus with chickpea salad, chorizo crumbs, and smoked paprika oil', price: 28.00, category: 'cat_005', image: null, isVeg: false, isPopular: true, isAvailable: true, prepTime: 20, calories: 380 },
  { id: 'item_025', name: 'Chilean Sea Bass', description: 'Miso-glazed sea bass with bok choy, jasmine rice, and ginger broth', price: 36.00, category: 'cat_005', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 22, calories: 420 },
  { id: 'item_026', name: 'Seafood Platter', description: 'Lobster tail, jumbo shrimp, oysters, and crab claws with lemon butter', price: 65.00, category: 'cat_005', image: null, isVeg: false, isPopular: true, isAvailable: true, prepTime: 30, calories: 580 },
  { id: 'item_027', name: 'Fish & Chips', description: 'Beer-battered Atlantic cod with thick-cut fries and tartare sauce', price: 20.00, category: 'cat_005', image: null, isVeg: false, isPopular: false, isAvailable: true, prepTime: 15, calories: 620 },

  // Desserts
  { id: 'item_028', name: 'Crème Brûlée', description: 'Classic vanilla bean crème brûlée with caramelized sugar top', price: 12.00, category: 'cat_006', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 8, calories: 380 },
  { id: 'item_029', name: 'Chocolate Fondant', description: 'Warm dark chocolate fondant with vanilla bean ice cream and gold leaf', price: 14.00, category: 'cat_006', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 15, calories: 520 },
  { id: 'item_030', name: 'Tiramisu', description: 'Classic Italian tiramisu with Marsala wine and espresso soaked ladyfingers', price: 13.00, category: 'cat_006', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 5, calories: 420 },
  { id: 'item_031', name: 'Panna Cotta', description: 'Silky vanilla panna cotta with mixed berry compote and mint', price: 11.00, category: 'cat_006', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 5, calories: 320 },
  { id: 'item_032', name: 'Affogato', description: 'Double espresso poured over artisan vanilla gelato', price: 9.00, category: 'cat_006', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 3, calories: 180 },

  // Beverages
  { id: 'item_033', name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 6.00, category: 'cat_007', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 3, calories: 120 },
  { id: 'item_034', name: 'Sparkling Water', description: 'San Pellegrino sparkling mineral water (750ml)', price: 5.00, category: 'cat_007', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 1, calories: 0 },
  { id: 'item_035', name: 'Espresso', description: 'Double-shot Italian espresso', price: 4.00, category: 'cat_007', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 3, calories: 5 },
  { id: 'item_036', name: 'Cappuccino', description: 'Double espresso with steamed milk and microfoam', price: 5.50, category: 'cat_007', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 4, calories: 120 },
  { id: 'item_037', name: 'Matcha Latte', description: 'Ceremonial grade matcha with oat milk', price: 6.50, category: 'cat_007', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 4, calories: 140 },
  { id: 'item_038', name: 'Iced Tea', description: 'House-brewed peach iced tea with fresh mint', price: 5.00, category: 'cat_007', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 2, calories: 80 },
  { id: 'item_039', name: 'Smoothie Bowl', description: 'Açaí smoothie with granola, banana, and mixed berries', price: 9.00, category: 'cat_007', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 5, calories: 280 },
  { id: 'item_040', name: 'Lemonade', description: 'Fresh lemonade with honey and ginger', price: 5.50, category: 'cat_007', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 3, calories: 110 },

  // Cocktails
  { id: 'item_041', name: 'Garden Spritz', description: 'Aperol, prosecco, elderflower, fresh herbs, and soda', price: 14.00, category: 'cat_008', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 5, calories: 180 },
  { id: 'item_042', name: 'Espresso Martini', description: 'Vodka, Kahlúa, fresh espresso, and vanilla syrup', price: 15.00, category: 'cat_008', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 5, calories: 220 },
  { id: 'item_043', name: 'Classic Negroni', description: 'Gin, Campari, and sweet vermouth with orange peel', price: 14.00, category: 'cat_008', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 4, calories: 190 },
  { id: 'item_044', name: 'Mojito', description: 'White rum, fresh lime, mint, sugar, and soda water', price: 13.00, category: 'cat_008', image: null, isVeg: true, isPopular: true, isAvailable: true, prepTime: 5, calories: 160 },
  { id: 'item_045', name: 'Old Fashioned', description: 'Bourbon, Angostura bitters, orange zest, and Luxardo cherry', price: 15.00, category: 'cat_008', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 4, calories: 200 },
  { id: 'item_046', name: 'Margarita', description: 'Tequila, Cointreau, fresh lime juice, and agave', price: 14.00, category: 'cat_008', image: null, isVeg: true, isPopular: false, isAvailable: true, prepTime: 4, calories: 170 },
];

export const tables = [
  { id: 'tbl_001', number: 1, seats: 2, status: 'available', branch: 'branch_001', section: 'Main Hall' },
  { id: 'tbl_002', number: 2, seats: 2, status: 'occupied', branch: 'branch_001', section: 'Main Hall', orderId: 'ord_001' },
  { id: 'tbl_003', number: 3, seats: 4, status: 'occupied', branch: 'branch_001', section: 'Main Hall', orderId: 'ord_002' },
  { id: 'tbl_004', number: 4, seats: 4, status: 'available', branch: 'branch_001', section: 'Main Hall' },
  { id: 'tbl_005', number: 5, seats: 6, status: 'reserved', branch: 'branch_001', section: 'Main Hall' },
  { id: 'tbl_006', number: 6, seats: 6, status: 'available', branch: 'branch_001', section: 'Main Hall' },
  { id: 'tbl_007', number: 7, seats: 2, status: 'occupied', branch: 'branch_001', section: 'Patio', orderId: 'ord_003' },
  { id: 'tbl_008', number: 8, seats: 4, status: 'available', branch: 'branch_001', section: 'Patio' },
  { id: 'tbl_009', number: 9, seats: 4, status: 'occupied', branch: 'branch_001', section: 'Patio', orderId: 'ord_004' },
  { id: 'tbl_010', number: 10, seats: 8, status: 'available', branch: 'branch_001', section: 'Private Dining' },
  { id: 'tbl_011', number: 11, seats: 2, status: 'available', branch: 'branch_001', section: 'Bar' },
  { id: 'tbl_012', number: 12, seats: 2, status: 'occupied', branch: 'branch_001', section: 'Bar', orderId: 'ord_005' },
  { id: 'tbl_013', number: 13, seats: 4, status: 'available', branch: 'branch_001', section: 'Main Hall' },
  { id: 'tbl_014', number: 14, seats: 4, status: 'cleaning', branch: 'branch_001', section: 'Main Hall' },
  { id: 'tbl_015', number: 15, seats: 2, status: 'available', branch: 'branch_001', section: 'Patio' },
  { id: 'tbl_016', number: 16, seats: 6, status: 'reserved', branch: 'branch_001', section: 'Main Hall' },
  { id: 'tbl_017', number: 17, seats: 4, status: 'available', branch: 'branch_001', section: 'Patio' },
  { id: 'tbl_018', number: 18, seats: 2, status: 'available', branch: 'branch_001', section: 'Bar' },
];

export const orders = [
  {
    id: 'ord_001', table: 'tbl_002', tableNumber: 2, status: 'preparing',
    items: [
      { ...menuItems[0], quantity: 1 },
      { ...menuItems[10], quantity: 2 },
      { ...menuItems[35], quantity: 2 },
    ],
    subtotal: 83.00, tax: 7.47, total: 90.47,
    createdAt: '2026-08-01T15:30:00', customerName: 'Alex Morgan',
    paymentMethod: 'card', paymentStatus: 'pending',
    notes: 'No onions on the ribeye please', waiter: 'staff_002',
  },
  {
    id: 'ord_002', table: 'tbl_003', tableNumber: 3, status: 'ready',
    items: [
      { ...menuItems[6], quantity: 2 },
      { ...menuItems[18], quantity: 1 },
      { ...menuItems[27], quantity: 2 },
      { ...menuItems[40], quantity: 2 },
    ],
    subtotal: 82.00, tax: 7.38, total: 89.38,
    createdAt: '2026-08-01T15:15:00', customerName: 'Sarah Chen',
    paymentMethod: 'cash', paymentStatus: 'pending', waiter: 'staff_003',
  },
  {
    id: 'ord_003', table: 'tbl_007', tableNumber: 7, status: 'new',
    items: [
      { ...menuItems[1], quantity: 1 },
      { ...menuItems[11], quantity: 1 },
      { ...menuItems[34], quantity: 2 },
    ],
    subtotal: 55.00, tax: 4.95, total: 59.95,
    createdAt: '2026-08-01T15:45:00', customerName: 'James Wilson',
    paymentMethod: 'card', paymentStatus: 'pending', waiter: 'staff_002',
  },
  {
    id: 'ord_004', table: 'tbl_009', tableNumber: 9, status: 'preparing',
    items: [
      { ...menuItems[4], quantity: 1 },
      { ...menuItems[13], quantity: 2 },
      { ...menuItems[19], quantity: 1 },
      { ...menuItems[28], quantity: 2 },
    ],
    subtotal: 108.00, tax: 9.72, total: 117.72,
    createdAt: '2026-08-01T15:20:00', customerName: 'Emily Davis',
    paymentMethod: 'card', paymentStatus: 'pending',
    notes: 'Birthday celebration — surprise dessert', waiter: 'staff_004',
  },
  {
    id: 'ord_005', table: 'tbl_012', tableNumber: 12, status: 'completed',
    items: [
      { ...menuItems[41], quantity: 2 },
      { ...menuItems[3], quantity: 1 },
    ],
    subtotal: 52.00, tax: 4.68, total: 56.68,
    createdAt: '2026-08-01T14:00:00', customerName: 'Michael Brown',
    paymentMethod: 'card', paymentStatus: 'paid', waiter: 'staff_003',
  },
  {
    id: 'ord_006', table: 'tbl_004', tableNumber: 4, status: 'delivered',
    items: [
      { ...menuItems[7], quantity: 1 },
      { ...menuItems[14], quantity: 1 },
      { ...menuItems[32], quantity: 2 },
    ],
    subtotal: 56.00, tax: 5.04, total: 61.04,
    createdAt: '2026-08-01T14:30:00', customerName: 'Lisa Park',
    paymentMethod: 'cash', paymentStatus: 'paid', waiter: 'staff_002',
  },
];

export const staff = [
  { id: 'staff_001', name: 'Robert Johnson', role: 'manager', email: 'robert@greentable.com', phone: '+1 555-111-0001', status: 'active', avatar: null, assignedTables: [] },
  { id: 'staff_002', name: 'Maria Garcia', role: 'waiter', email: 'maria@greentable.com', phone: '+1 555-111-0002', status: 'active', avatar: null, assignedTables: ['tbl_002', 'tbl_007', 'tbl_004'] },
  { id: 'staff_003', name: 'David Kim', role: 'waiter', email: 'david@greentable.com', phone: '+1 555-111-0003', status: 'active', avatar: null, assignedTables: ['tbl_003', 'tbl_012', 'tbl_008'] },
  { id: 'staff_004', name: 'Sophie Taylor', role: 'waiter', email: 'sophie@greentable.com', phone: '+1 555-111-0004', status: 'active', avatar: null, assignedTables: ['tbl_009', 'tbl_005', 'tbl_010'] },
  { id: 'staff_005', name: 'Thomas Chen', role: 'chef', email: 'thomas@greentable.com', phone: '+1 555-111-0005', status: 'active', avatar: null, assignedTables: [] },
  { id: 'staff_006', name: 'Elena Rodriguez', role: 'chef', email: 'elena@greentable.com', phone: '+1 555-111-0006', status: 'active', avatar: null, assignedTables: [] },
  { id: 'staff_007', name: 'James Wright', role: 'bartender', email: 'james@greentable.com', phone: '+1 555-111-0007', status: 'active', avatar: null, assignedTables: ['tbl_011', 'tbl_018'] },
  { id: 'staff_008', name: 'Anna Lee', role: 'host', email: 'anna@greentable.com', phone: '+1 555-111-0008', status: 'offline', avatar: null, assignedTables: [] },
];

export const customers = [
  { id: 'cust_001', name: 'Alex Morgan', email: 'alex@email.com', phone: '+1 555-200-0001', visits: 12, totalSpent: 684.50, lastVisit: '2026-08-01', rating: 5 },
  { id: 'cust_002', name: 'Sarah Chen', email: 'sarah@email.com', phone: '+1 555-200-0002', visits: 8, totalSpent: 452.30, lastVisit: '2026-08-01', rating: 4 },
  { id: 'cust_003', name: 'James Wilson', email: 'james@email.com', phone: '+1 555-200-0003', visits: 3, totalSpent: 178.90, lastVisit: '2026-08-01', rating: 5 },
  { id: 'cust_004', name: 'Emily Davis', email: 'emily@email.com', phone: '+1 555-200-0004', visits: 15, totalSpent: 1120.00, lastVisit: '2026-08-01', rating: 5 },
  { id: 'cust_005', name: 'Michael Brown', email: 'michael@email.com', phone: '+1 555-200-0005', visits: 6, totalSpent: 342.10, lastVisit: '2026-08-01', rating: 4 },
  { id: 'cust_006', name: 'Lisa Park', email: 'lisa@email.com', phone: '+1 555-200-0006', visits: 22, totalSpent: 1560.80, lastVisit: '2026-08-01', rating: 5 },
  { id: 'cust_007', name: 'Ryan Martinez', email: 'ryan@email.com', phone: '+1 555-200-0007', visits: 4, totalSpent: 198.50, lastVisit: '2026-07-28', rating: 3 },
  { id: 'cust_008', name: 'Jennifer Lopez', email: 'jen@email.com', phone: '+1 555-200-0008', visits: 9, totalSpent: 567.40, lastVisit: '2026-07-30', rating: 4 },
];

export const reviews = [
  { id: 'rev_001', customer: 'cust_006', customerName: 'Lisa Park', rating: 5, comment: 'Absolutely stunning dining experience! The truffle linguine was perfection and the service was impeccable. Will definitely be back.', date: '2026-07-30', reply: 'Thank you so much, Lisa! We\'re thrilled you enjoyed the truffle linguine. See you soon!' },
  { id: 'rev_002', customer: 'cust_004', customerName: 'Emily Davis', rating: 5, comment: 'Celebrated my birthday here and it was magical. The staff surprised us with a beautiful dessert. The wagyu burger is a must-try!', date: '2026-07-28', reply: 'Happy birthday, Emily! We loved being part of your celebration. 🎂' },
  { id: 'rev_003', customer: 'cust_002', customerName: 'Sarah Chen', rating: 4, comment: 'Great food and ambiance. The wait was a bit long for the mains but the quality made up for it. The espresso martini is outstanding!', date: '2026-07-25', reply: null },
  { id: 'rev_004', customer: 'cust_007', customerName: 'Ryan Martinez', rating: 3, comment: 'Food was good but nothing extraordinary for the price point. Service could be more attentive. The patio seating was lovely though.', date: '2026-07-22', reply: 'Thanks for the feedback, Ryan. We\'re working on improving our service standards.' },
  { id: 'rev_005', customer: 'cust_001', customerName: 'Alex Morgan', rating: 5, comment: 'My go-to spot for special occasions. The ribeye steak is cooked to perfection every single time. Amazing wine list too!', date: '2026-07-20', reply: null },
  { id: 'rev_006', customer: 'cust_008', customerName: 'Jennifer Lopez', rating: 4, comment: 'Beautiful restaurant with excellent food. The chocolate fondant is divine. Would love to see more vegan options on the menu.', date: '2026-07-18', reply: 'Thank you, Jennifer! Great suggestion — we\'re expanding our plant-based offerings next month!' },
];

export const offers = [
  { id: 'off_001', name: 'Happy Hour Special', description: '25% off all cocktails', discount: 25, type: 'percentage', category: 'cat_008', startDate: '2026-08-01', endDate: '2026-08-31', isActive: true, usageCount: 145 },
  { id: 'off_002', name: 'Lunch Combo', description: 'Starter + Main for $35', discount: 35, type: 'fixed', category: null, startDate: '2026-08-01', endDate: '2026-08-31', isActive: true, usageCount: 89 },
  { id: 'off_003', name: 'Dessert Tuesday', description: 'Free dessert with any main course on Tuesdays', discount: 100, type: 'percentage', category: 'cat_006', startDate: '2026-08-01', endDate: '2026-09-30', isActive: true, usageCount: 34 },
  { id: 'off_004', name: 'First Order Discount', description: '15% off your first order via QR menu', discount: 15, type: 'percentage', category: null, startDate: '2026-07-01', endDate: '2026-12-31', isActive: true, usageCount: 210 },
];

export const payments = [
  { id: 'pay_001', orderId: 'ord_005', amount: 56.68, method: 'card', status: 'completed', date: '2026-08-01T14:45:00', cardLast4: '4242' },
  { id: 'pay_002', orderId: 'ord_006', amount: 61.04, method: 'cash', status: 'completed', date: '2026-08-01T15:10:00', cardLast4: null },
  { id: 'pay_003', orderId: 'ord_007', amount: 127.50, method: 'card', status: 'completed', date: '2026-07-31T20:30:00', cardLast4: '1234' },
  { id: 'pay_004', orderId: 'ord_008', amount: 89.00, method: 'card', status: 'completed', date: '2026-07-31T19:15:00', cardLast4: '5678' },
  { id: 'pay_005', orderId: 'ord_009', amount: 45.50, method: 'cash', status: 'completed', date: '2026-07-31T14:00:00', cardLast4: null },
  { id: 'pay_006', orderId: 'ord_010', amount: 198.00, method: 'card', status: 'completed', date: '2026-07-30T21:00:00', cardLast4: '9012' },
  { id: 'pay_007', orderId: 'ord_011', amount: 72.30, method: 'card', status: 'refunded', date: '2026-07-30T13:30:00', cardLast4: '3456' },
];

export const analyticsData = {
  revenue: {
    today: 4280.50,
    yesterday: 3920.00,
    thisWeek: 28450.00,
    lastWeek: 26180.00,
    thisMonth: 112400.00,
    lastMonth: 98600.00,
  },
  orders: {
    today: 47,
    yesterday: 42,
    thisWeek: 312,
    lastWeek: 289,
    thisMonth: 1280,
    lastMonth: 1150,
  },
  customers: {
    today: 38,
    new: 5,
    returning: 33,
    total: 856,
  },
  popularItems: [
    { name: 'Grilled Ribeye Steak', orders: 156, revenue: 6552.00 },
    { name: 'Truffle Linguine', orders: 134, revenue: 3484.00 },
    { name: 'Espresso Martini', orders: 128, revenue: 1920.00 },
    { name: 'Wagyu Burger', orders: 112, revenue: 2912.00 },
    { name: 'Crème Brûlée', orders: 98, revenue: 1176.00 },
  ],
  peakHours: [
    { hour: '11:00', orders: 12 },
    { hour: '12:00', orders: 28 },
    { hour: '13:00', orders: 35 },
    { hour: '14:00', orders: 18 },
    { hour: '15:00', orders: 8 },
    { hour: '16:00', orders: 5 },
    { hour: '17:00', orders: 10 },
    { hour: '18:00', orders: 22 },
    { hour: '19:00', orders: 42 },
    { hour: '20:00', orders: 48 },
    { hour: '21:00', orders: 38 },
    { hour: '22:00', orders: 15 },
  ],
  revenueByDay: [
    { day: 'Mon', revenue: 3200 },
    { day: 'Tue', revenue: 2800 },
    { day: 'Wed', revenue: 3400 },
    { day: 'Thu', revenue: 3800 },
    { day: 'Fri', revenue: 5200 },
    { day: 'Sat', revenue: 5800 },
    { day: 'Sun', revenue: 4250 },
  ],
};

export const notifications = [
  { id: 'notif_001', type: 'new_order', message: 'New order from Table 7', time: '2 min ago', read: false },
  { id: 'notif_002', type: 'call_waiter', message: 'Table 3 is calling for a waiter', time: '5 min ago', read: false },
  { id: 'notif_003', type: 'bill_request', message: 'Table 12 requested the bill', time: '8 min ago', read: true },
  { id: 'notif_004', type: 'order_ready', message: 'Order #002 is ready for delivery', time: '10 min ago', read: true },
  { id: 'notif_005', type: 'new_review', message: 'New 5-star review from Lisa Park', time: '30 min ago', read: true },
  { id: 'notif_006', type: 'low_stock', message: 'Shrimp Cocktail marked as unavailable', time: '1 hr ago', read: true },
];

export const pricingPlans = [
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'Perfect for small restaurants just getting started',
    features: [
      'Up to 20 tables',
      'QR menu generation',
      'Basic order management',
      'Customer feedback',
      'Email support',
      '1 branch',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: 99,
    period: 'month',
    description: 'Everything you need to run a modern restaurant',
    features: [
      'Unlimited tables',
      'Kitchen Display System',
      'Staff management',
      'Advanced analytics',
      'Payment integration',
      'Priority support',
      'Up to 3 branches',
      'Custom branding',
      'Offer management',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 249,
    period: 'month',
    description: 'For restaurant chains and large operations',
    features: [
      'Everything in Professional',
      'Unlimited branches',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'White-label option',
      'Advanced security',
      'Custom reports',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];
