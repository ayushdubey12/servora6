/* ============================================
   SERVORA — Mock Data (Hotel Siraj)
   Fallback data for offline / pre-DB state
   ============================================ */

export const restaurant = {
  id: 'rest_hotel_siraj',
  name: 'Hotel Siraj',
  slug: 'hotel-siraj',
  cuisine: 'Hyderabadi & North Indian',
  description: 'Authentic Hyderabadi and North Indian cuisine since 1986. Legendary Biryani, rich curries, and traditional tandoor delicacies.',
  logo: null,
  phone: '+91 40 2345 6789',
  email: 'info@hotelsiraj.in',
  website: 'https://hotelsiraj.in',
  address: '42-58, Masab Tank, Abids, Hyderabad, Telangana 500028',
  rating: 4.6,
  reviewCount: 1240,
  openingHours: {
    mon: { open: '11:00', close: '23:00' },
    tue: { open: '11:00', close: '23:00' },
    wed: { open: '11:00', close: '23:00' },
    thu: { open: '11:00', close: '23:00' },
    fri: { open: '11:00', close: '23:30' },
    sat: { open: '11:00', close: '23:30' },
    sun: { open: '10:00', close: '23:00' },
  },
};

export const branches = [
  { id: 'branch_main', name: 'Main Branch — Abids', address: '42-58, Masab Tank, Abids, Hyderabad', tables: 15, status: 'active' },
  { id: 'branch_banjara', name: 'Banjara Hills', address: '8-2-608, Road No. 10, Banjara Hills, Hyderabad', tables: 12, status: 'active' },
  { id: 'branch_hitec', name: 'HITEC City (Coming Soon)', address: 'Cyber Towers, HITEC City, Hyderabad', tables: 18, status: 'coming_soon' },
];

export const categories = [
  { id: 'cat_001', name: 'Starters', slug: 'starters', itemCount: 6, order: 1 },
  { id: 'cat_002', name: 'Biryani', slug: 'biryani', itemCount: 5, order: 2 },
  { id: 'cat_003', name: 'Tandoor', slug: 'tandoor', itemCount: 5, order: 3 },
  { id: 'cat_004', name: 'Curries', slug: 'curries', itemCount: 6, order: 4 },
  { id: 'cat_005', name: 'Breads', slug: 'breads', itemCount: 6, order: 5 },
  { id: 'cat_006', name: 'Rice & Dal', slug: 'rice-dal', itemCount: 4, order: 6 },
  { id: 'cat_007', name: 'Desserts', slug: 'desserts', itemCount: 5, order: 7 },
  { id: 'cat_008', name: 'Beverages', slug: 'beverages', itemCount: 8, order: 8 },
];

export const menuItems = [
  // Starters
  { id: 'item_001', name: 'Chicken 65', description: 'Spicy deep-fried chicken tossed with curry leaves, red chillies, and a hint of lemon', price: 280, category: 'cat_001', isVeg: false, isPopular: true, isAvailable: true, prepTime: 10, calories: 320 },
  { id: 'item_002', name: 'Paneer Tikka', description: 'Chargrilled cottage cheese cubes marinated in hung curd and secret spices', price: 260, category: 'cat_001', isVeg: true, isPopular: true, isAvailable: true, prepTime: 12, calories: 280 },
  { id: 'item_003', name: 'Mutton Seekh Kebab', description: 'Minced mutton skewers grilled in tandoor with fresh herbs and spices', price: 340, category: 'cat_001', isVeg: false, isPopular: false, isAvailable: true, prepTime: 15, calories: 380 },
  { id: 'item_004', name: 'Veg Spring Rolls', description: 'Crunchy rolls stuffed with mixed vegetables and glass noodles', price: 180, category: 'cat_001', isVeg: true, isPopular: false, isAvailable: true, prepTime: 8, calories: 220 },
  { id: 'item_005', name: 'Fish Amritsari', description: 'Batter-fried river fish fillets with tangy tamarind chutney', price: 320, category: 'cat_001', isVeg: false, isPopular: true, isAvailable: true, prepTime: 12, calories: 340 },
  { id: 'item_006', name: 'Hara Bhara Kebab', description: 'Spinach and green pea patties with paneer, pan-fried to perfection', price: 200, category: 'cat_001', isVeg: true, isPopular: false, isAvailable: true, prepTime: 10, calories: 200 },

  // Biryani
  { id: 'item_007', name: 'Hyderabadi Mutton Biryani', description: 'Our legendary slow-cooked dum biryani with tender mutton, saffron, and fried onions', price: 420, category: 'cat_002', isVeg: false, isPopular: true, isAvailable: true, prepTime: 25, calories: 580 },
  { id: 'item_008', name: 'Chicken Dum Biryani', description: 'Fragrant basmati rice layered with spiced chicken, sealed and cooked on dum', price: 350, category: 'cat_002', isVeg: false, isPopular: true, isAvailable: true, prepTime: 20, calories: 520 },
  { id: 'item_009', name: 'Veg Biryani', description: 'Garden vegetables slow-cooked with aromatic rice and whole spices', price: 280, category: 'cat_002', isVeg: true, isPopular: false, isAvailable: true, prepTime: 18, calories: 420 },
  { id: 'item_010', name: 'Mutton Bone Marrow Biryani', description: 'Special cut mutton biryani with rich marrow gravy on the side', price: 520, category: 'cat_002', isVeg: false, isPopular: true, isAvailable: true, prepTime: 30, calories: 640 },
  { id: 'item_011', name: 'Egg Biryani', description: 'Boiled eggs layered with spiced rice and caramelized onions', price: 250, category: 'cat_002', isVeg: false, isPopular: false, isAvailable: true, prepTime: 15, calories: 460 },

  // Tandoor
  { id: 'item_012', name: 'Tandoori Chicken', description: 'Whole chicken leg marinated overnight in yogurt and spices, roasted in clay oven', price: 380, category: 'cat_003', isVeg: false, isPopular: true, isAvailable: true, prepTime: 20, calories: 420 },
  { id: 'item_013', name: 'Butter Chicken', description: 'Tandoori chicken pieces simmered in a velvety tomato-butter gravy', price: 360, category: 'cat_003', isVeg: false, isPopular: true, isAvailable: true, prepTime: 18, calories: 480 },
  { id: 'item_014', name: 'Reshmi Kebab', description: 'Silky smooth chicken mince kebabs with cream cheese and mild spices', price: 320, category: 'cat_003', isVeg: false, isPopular: false, isAvailable: true, prepTime: 15, calories: 340 },
  { id: 'item_015', name: 'Paneer Malai Kebab', description: 'Cottage cheese cubes with cream, cashew paste, and mild aromatic spices', price: 300, category: 'cat_003', isVeg: true, isPopular: true, isAvailable: true, prepTime: 12, calories: 300 },
  { id: 'item_016', name: 'Tandoori Pomfret', description: 'Whole pomfret marinated in tandoori masala, grilled over charcoal', price: 550, category: 'cat_003', isVeg: false, isPopular: false, isAvailable: true, prepTime: 25, calories: 380 },

  // Curries
  { id: 'item_017', name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked mutton in a rich, aromatic red gravy', price: 400, category: 'cat_004', isVeg: false, isPopular: true, isAvailable: true, prepTime: 20, calories: 520 },
  { id: 'item_018', name: 'Chicken Korma', description: 'Tender chicken in a creamy cashew and poppy seed sauce', price: 340, category: 'cat_004', isVeg: false, isPopular: false, isAvailable: true, prepTime: 18, calories: 460 },
  { id: 'item_019', name: 'Paneer Butter Masala', description: 'Soft paneer cubes in a rich, creamy tomato and butter sauce', price: 300, category: 'cat_004', isVeg: true, isPopular: true, isAvailable: true, prepTime: 15, calories: 400 },
  { id: 'item_020', name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream', price: 260, category: 'cat_004', isVeg: true, isPopular: true, isAvailable: true, prepTime: 10, calories: 340 },
  { id: 'item_021', name: 'Chettinad Chicken', description: 'Spicy and aromatic chicken curry from the Chettinad region', price: 350, category: 'cat_004', isVeg: false, isPopular: false, isAvailable: true, prepTime: 20, calories: 440 },
  { id: 'item_022', name: 'Baingan Bharta', description: 'Smoky roasted eggplant mashed and cooked with onions, tomatoes, and spices', price: 220, category: 'cat_004', isVeg: true, isPopular: false, isAvailable: true, prepTime: 12, calories: 240 },

  // Breads
  { id: 'item_023', name: 'Butter Naan', description: 'Soft leavened bread brushed with butter, baked in tandoor', price: 60, category: 'cat_005', isVeg: true, isPopular: true, isAvailable: true, prepTime: 5, calories: 180 },
  { id: 'item_024', name: 'Garlic Naan', description: 'Naan studded with fresh garlic and cilantro', price: 70, category: 'cat_005', isVeg: true, isPopular: true, isAvailable: true, prepTime: 5, calories: 190 },
  { id: 'item_025', name: 'Roomali Roti', description: 'Paper-thin handkerchief bread folded and served hot', price: 50, category: 'cat_005', isVeg: true, isPopular: false, isAvailable: true, prepTime: 4, calories: 140 },
  { id: 'item_026', name: 'Lachha Paratha', description: 'Flaky multi-layered whole wheat bread with ghee', price: 60, category: 'cat_005', isVeg: true, isPopular: false, isAvailable: true, prepTime: 6, calories: 220 },
  { id: 'item_027', name: 'Keema Naan', description: 'Naan stuffed with spiced minced mutton', price: 90, category: 'cat_005', isVeg: false, isPopular: true, isAvailable: true, prepTime: 8, calories: 260 },
  { id: 'item_028', name: 'Missi Roti', description: 'Gram flour flatbread with ajwain seeds and spices', price: 55, category: 'cat_005', isVeg: true, isPopular: false, isAvailable: true, prepTime: 5, calories: 170 },

  // Rice & Dal
  { id: 'item_029', name: 'Jeera Rice', description: 'Basmati rice tempered with cumin seeds and ghee', price: 160, category: 'cat_006', isVeg: true, isPopular: true, isAvailable: true, prepTime: 10, calories: 320 },
  { id: 'item_030', name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin, garlic, and ghee', price: 180, category: 'cat_006', isVeg: true, isPopular: true, isAvailable: true, prepTime: 8, calories: 280 },
  { id: 'item_031', name: 'Dal Fry', description: 'Mixed lentils cooked with tomatoes, onions, and spices', price: 180, category: 'cat_006', isVeg: true, isPopular: false, isAvailable: true, prepTime: 8, calories: 290 },
  { id: 'item_032', name: 'Steam Rice', description: 'Plain steamed basmati rice', price: 120, category: 'cat_006', isVeg: true, isPopular: false, isAvailable: true, prepTime: 10, calories: 300 },

  // Desserts
  { id: 'item_033', name: 'Double Ka Meetha', description: 'Hyderabadi bread pudding soaked in saffron milk, garnished with pistachios', price: 160, category: 'cat_007', isVeg: true, isPopular: true, isAvailable: true, prepTime: 8, calories: 380 },
  { id: 'item_034', name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup', price: 120, category: 'cat_007', isVeg: true, isPopular: true, isAvailable: true, prepTime: 5, calories: 340 },
  { id: 'item_035', name: 'Kulfi Falooda', description: 'Traditional Indian ice cream with rose syrup, basil seeds, and vermicelli', price: 150, category: 'cat_007', isVeg: true, isPopular: true, isAvailable: true, prepTime: 5, calories: 320 },
  { id: 'item_036', name: 'Phirni', description: 'Creamy ground rice pudding flavoured with cardamom and saffron', price: 130, category: 'cat_007', isVeg: true, isPopular: false, isAvailable: true, prepTime: 5, calories: 280 },
  { id: 'item_037', name: 'Jalebi', description: 'Crispy spirals deep-fried and soaked in warm saffron syrup', price: 100, category: 'cat_007', isVeg: true, isPopular: true, isAvailable: true, prepTime: 8, calories: 360 },

  // Beverages
  { id: 'item_038', name: 'Masala Chai', description: 'Strong Assam tea brewed with ginger, cardamom, and cinnamon', price: 40, category: 'cat_008', isVeg: true, isPopular: true, isAvailable: true, prepTime: 4, calories: 60 },
  { id: 'item_039', name: 'Mango Lassi', description: 'Thick and creamy Alphonso mango yoghurt shake', price: 90, category: 'cat_008', isVeg: true, isPopular: true, isAvailable: true, prepTime: 3, calories: 220 },
  { id: 'item_040', name: 'Sweet Lassi', description: 'Refreshing chilled yoghurt drink sweetened with sugar', price: 70, category: 'cat_008', isVeg: true, isPopular: false, isAvailable: true, prepTime: 2, calories: 180 },
  { id: 'item_041', name: 'Nimbu Pani', description: 'Freshly squeezed lemon water with a pinch of cumin and black salt', price: 40, category: 'cat_008', isVeg: true, isPopular: false, isAvailable: true, prepTime: 2, calories: 30 },
  { id: 'item_042', name: 'Cold Coffee', description: 'Iced coffee blended with milk, chocolate, and vanilla', price: 110, category: 'cat_008', isVeg: true, isPopular: true, isAvailable: true, prepTime: 3, calories: 240 },
  { id: 'item_043', name: 'Thandai', description: 'Chilled spiced milk with almonds, saffron, and fennel seeds', price: 100, category: 'cat_008', isVeg: true, isPopular: false, isAvailable: true, prepTime: 3, calories: 200 },
  { id: 'item_044', name: 'Fresh Lime Soda', description: 'Lime soda — sweet or salty, your choice', price: 50, category: 'cat_008', isVeg: true, isPopular: true, isAvailable: true, prepTime: 2, calories: 40 },
  { id: 'item_045', name: 'Rooh Afza', description: 'Classic rose and herb syrup blended with chilled milk', price: 60, category: 'cat_008', isVeg: true, isPopular: false, isAvailable: true, prepTime: 2, calories: 120 },
];

export const tables = [
  { id: 'tbl_001', number: 1, seats: 2, status: 'available', section: 'Main Hall' },
  { id: 'tbl_002', number: 2, seats: 2, status: 'available', section: 'Main Hall' },
  { id: 'tbl_003', number: 3, seats: 4, status: 'occupied', section: 'Main Hall' },
  { id: 'tbl_004', number: 4, seats: 4, status: 'available', section: 'Main Hall' },
  { id: 'tbl_005', number: 5, seats: 4, status: 'available', section: 'Main Hall' },
  { id: 'tbl_006', number: 6, seats: 6, status: 'reserved', section: 'Family Section' },
  { id: 'tbl_007', number: 7, seats: 6, status: 'available', section: 'Family Section' },
  { id: 'tbl_008', number: 8, seats: 2, status: 'occupied', section: 'Main Hall' },
  { id: 'tbl_009', number: 9, seats: 4, status: 'available', section: 'Patio' },
  { id: 'tbl_010', number: 10, seats: 8, status: 'available', section: 'Private Dining' },
  { id: 'tbl_011', number: 11, seats: 2, status: 'available', section: 'Main Hall' },
  { id: 'tbl_012', number: 12, seats: 4, status: 'cleaning', section: 'Main Hall' },
  { id: 'tbl_013', number: 13, seats: 6, status: 'available', section: 'Family Section' },
  { id: 'tbl_014', number: 14, seats: 2, status: 'available', section: 'Patio' },
  { id: 'tbl_015', number: 15, seats: 10, status: 'available', section: 'Private Dining' },
];

export const orders = [];
export const staff = [
  { id: 'staff_001', name: 'Siraj Ahmed', role: 'owner', email: 'owner@hotelsiraj.in', phone: '+91 98765 00001', status: 'active' },
  { id: 'staff_002', name: 'Chef Imran', role: 'chef', email: 'chef@hotelsiraj.in', phone: '+91 98765 00002', status: 'active' },
  { id: 'staff_003', name: 'Rahul Kumar', role: 'waiter', email: 'waiter@hotelsiraj.in', phone: '+91 98765 00003', status: 'active' },
  { id: 'staff_004', name: 'Vikram Singh', role: 'waiter', email: 'waiter2@hotelsiraj.in', phone: '+91 98765 00004', status: 'active' },
];
export const customers = [
  { id: 'cust_001', name: 'Arjun Reddy', email: 'arjun@customer.com', phone: '+91 98765 43210', visits: 5, totalSpent: 2450, lastVisit: '2026-08-01', rating: 5 },
  { id: 'cust_002', name: 'Priya Sharma', email: 'priya@customer.com', phone: '+91 98765 43211', visits: 3, totalSpent: 1680, lastVisit: '2026-07-30', rating: 4 },
];
export const reviews = [];
export const offers = [
  { id: 'off_001', name: 'Biryani Bonanza', description: '₹100 off on any Biryani order above ₹300', discount: 100, type: 'fixed', isActive: true, usageCount: 89 },
  { id: 'off_002', name: 'Family Feast', description: '15% off on orders above ₹1500', discount: 15, type: 'percentage', isActive: true, usageCount: 45 },
];
export const payments = [];
export const analyticsData = {
  revenue: { today: 32400, yesterday: 28800, thisWeek: 210000, lastWeek: 195000, thisMonth: 840000, lastMonth: 780000 },
  orders: { today: 42, yesterday: 38, thisWeek: 280, lastWeek: 260, thisMonth: 1120, lastMonth: 1040 },
  customers: { today: 35, new: 4, returning: 31, total: 620 },
  popularItems: [
    { name: 'Hyderabadi Mutton Biryani', orders: 180, revenue: 75600 },
    { name: 'Chicken 65', orders: 145, revenue: 40600 },
    { name: 'Butter Chicken', orders: 130, revenue: 46800 },
    { name: 'Paneer Butter Masala', orders: 110, revenue: 33000 },
    { name: 'Gulab Jamun', orders: 95, revenue: 11400 },
  ],
  peakHours: [
    { hour: '11:00', orders: 10 }, { hour: '12:00', orders: 25 }, { hour: '13:00', orders: 30 },
    { hour: '14:00', orders: 15 }, { hour: '15:00', orders: 6 }, { hour: '16:00', orders: 4 },
    { hour: '17:00', orders: 8 }, { hour: '18:00', orders: 20 }, { hour: '19:00', orders: 38 },
    { hour: '20:00', orders: 42 }, { hour: '21:00', orders: 35 }, { hour: '22:00', orders: 12 },
  ],
  revenueByDay: [
    { day: 'Mon', revenue: 24000 }, { day: 'Tue', revenue: 22000 }, { day: 'Wed', revenue: 26000 },
    { day: 'Thu', revenue: 28000 }, { day: 'Fri', revenue: 38000 }, { day: 'Sat', revenue: 42000 },
    { day: 'Sun', revenue: 30000 },
  ],
};
export const notifications = [
  { id: 'notif_001', type: 'new_order', message: 'New order from Table 7', time: '2 min ago', read: false },
  { id: 'notif_002', type: 'new_order', message: 'New order from Table 3', time: '5 min ago', read: false },
];
export const pricingPlans = [
  {
    name: 'Starter',
    price: 499,
    period: 'month',
    description: 'Perfect for small restaurants just getting started',
    features: ['Up to 20 tables', 'QR menu generation', 'Basic order management', 'Customer feedback', 'Email support', '1 branch'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: 1499,
    period: 'month',
    description: 'Everything you need to run a modern restaurant',
    features: ['Unlimited tables', 'Kitchen Display System', 'Staff management', 'Advanced analytics', 'Payment integration', 'Priority support', 'Up to 3 branches', 'Custom branding', 'Offer management'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 3999,
    period: 'month',
    description: 'For restaurant chains and large operations',
    features: ['Everything in Professional', 'Unlimited branches', 'API access', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'White-label option', 'Advanced security', 'Custom reports', 'Training & onboarding'],
    cta: 'Contact Sales',
    popular: false,
  },
];
