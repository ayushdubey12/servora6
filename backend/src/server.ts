import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from './lib/prisma.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (process.env.NODE_ENV !== 'production') {
    return allowedOrigins.length === 0 || allowedOrigins.includes(origin);
  }
  return allowedOrigins.includes(origin);
}

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'SERVORA backend is running' });
});

function parseJsonValue(value: string | null | undefined) {
  if (!value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function paramStr(val: unknown): string {
  return Array.isArray(val) ? val[0] : String(val);
}

// Wrapper to catch async errors in Express 4 route handlers
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ── Helpers ─────────────────────────────────────────────────────
async function getRestaurant() {
  return prisma.restaurant.findFirst();
}

// ── Seed: Hotel Siraj ───────────────────────────────────────────
async function seedDefaultData() {
  const existing = await prisma.restaurant.findFirst();
  if (existing) return existing;

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Hotel Siraj',
      slug: 'hotel-siraj',
      description: 'Authentic Hyderabadi and North Indian cuisine since 1986. Legendary Biryani, rich curries, and traditional tandoor delicacies.',
      phone: '+91 40 2345 6789',
      email: 'info@hotelsiraj.in',
      address: '42-58, Masab Tank, Abids, Hyderabad, Telangana 500028',
      openingHours: JSON.stringify({
        mon: { open: '11:00', close: '23:00' },
        tue: { open: '11:00', close: '23:00' },
        wed: { open: '11:00', close: '23:00' },
        thu: { open: '11:00', close: '23:00' },
        fri: { open: '11:00', close: '23:30' },
        sat: { open: '11:00', close: '23:30' },
        sun: { open: '10:00', close: '23:00' },
      }),
      settings: JSON.stringify({}),
    },
  });

  // ── Users ──
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.createMany({
    data: [
      { name: 'Siraj Ahmed', email: 'owner@hotelsiraj.in', password: passwordHash, role: 'owner', restaurantId: restaurant.id },
      { name: 'Chef Imran', email: 'chef@hotelsiraj.in', password: passwordHash, role: 'chef', restaurantId: restaurant.id },
      { name: 'Rahul Kumar', email: 'waiter@hotelsiraj.in', password: passwordHash, role: 'waiter', restaurantId: restaurant.id },
      { name: 'Vikram Singh', email: 'waiter2@hotelsiraj.in', password: passwordHash, role: 'waiter', restaurantId: restaurant.id },
    ],
  }).catch(() => {});

  // ── Categories ──
  const catData = [
    { name: 'Starters', slug: 'starters', order: 1 },
    { name: 'Biryani', slug: 'biryani', order: 2 },
    { name: 'Tandoor', slug: 'tandoor', order: 3 },
    { name: 'Curries', slug: 'curries', order: 4 },
    { name: 'Breads', slug: 'breads', order: 5 },
    { name: 'Rice & Dal', slug: 'rice-dal', order: 6 },
    { name: 'Desserts', slug: 'desserts', order: 7 },
    { name: 'Beverages', slug: 'beverages', order: 8 },
  ];
  const cats = await Promise.all(catData.map(c => prisma.category.create({
    data: { ...c, itemCount: 0, restaurantId: restaurant.id },
  })));
  const [starter, biryani, tandoor, curry, bread, rice, dessert, beverage] = cats;

  // ── Menu Items (₹ pricing) ──
  const items = [
    // Starters
    { name: 'Chicken 65', description: 'Spicy deep-fried chicken tossed with curry leaves, red chillies, and a hint of lemon', price: 280, categoryId: starter.id, isVeg: false },
    { name: 'Paneer Tikka', description: 'Chargrilled cottage cheese cubes marinated in hung curd and secret spices', price: 260, categoryId: starter.id, isVeg: true },
    { name: 'Mutton Seekh Kebab', description: 'Minced mutton skewers grilled in tandoor with fresh herbs and spices', price: 340, categoryId: starter.id, isVeg: false },
    { name: 'Veg Spring Rolls', description: 'Crunchy rolls stuffed with mixed vegetables and glass noodles', price: 180, categoryId: starter.id, isVeg: true },
    { name: 'Fish Amritsari', description: 'Batter-fried river fish fillets with tangy tamarind chutney', price: 320, categoryId: starter.id, isVeg: false },
    { name: 'Hara Bhara Kebab', description: 'Spinach and green pea patties with paneer, pan-fried to perfection', price: 200, categoryId: starter.id, isVeg: true },

    // Biryani
    { name: 'Hyderabadi Mutton Biryani', description: 'Our legendary slow-cooked dum biryani with tender mutton, saffron, and fried onions', price: 420, categoryId: biryani.id, isVeg: false },
    { name: 'Chicken Dum Biryani', description: 'Fragrant basmati rice layered with spiced chicken, sealed and cooked on dum', price: 350, categoryId: biryani.id, isVeg: false },
    { name: 'Veg Biryani', description: 'Garden vegetables slow-cooked with aromatic rice and whole spices', price: 280, categoryId: biryani.id, isVeg: true },
    { name: 'Mutton Bone Marrow Biryani', description: 'Special cut mutton biryani with rich marrow gravy on the side', price: 520, categoryId: biryani.id, isVeg: false },
    { name: 'Egg Biryani', description: 'Boiled eggs layered with spiced rice and caramelized onions', price: 250, categoryId: biryani.id, isVeg: false },

    // Tandoor
    { name: 'Tandoori Chicken', description: 'Whole chicken leg marinated overnight in yogurt and spices, roasted in clay oven', price: 380, categoryId: tandoor.id, isVeg: false },
    { name: 'Butter Chicken', description: 'Tandoori chicken pieces simmered in a velvety tomato-butter gravy', price: 360, categoryId: tandoor.id, isVeg: false },
    { name: 'Reshmi Kebab', description: 'Silky smooth chicken mince kebabs with cream cheese and mild spices', price: 320, categoryId: tandoor.id, isVeg: false },
    { name: 'Paneer Malai Kebab', description: 'Cottage cheese cubes with cream, cashew paste, and mild aromatic spices', price: 300, categoryId: tandoor.id, isVeg: true },
    { name: 'Tandoori Pomfret', description: 'Whole pomfret marinated in tandoori masala, grilled over charcoal', price: 550, categoryId: tandoor.id, isVeg: false },

    // Curries
    { name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked mutton in a rich, aromatic red gravy', price: 400, categoryId: curry.id, isVeg: false },
    { name: 'Chicken Korma', description: 'Tender chicken in a creamy cashew and poppy seed sauce', price: 340, categoryId: curry.id, isVeg: false },
    { name: 'Paneer Butter Masala', description: 'Soft paneer cubes in a rich, creamy tomato and butter sauce', price: 300, categoryId: curry.id, isVeg: true },
    { name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream', price: 260, categoryId: curry.id, isVeg: true },
    { name: 'Chettinad Chicken', description: 'Spicy and aromatic chicken curry from the Chettinad region', price: 350, categoryId: curry.id, isVeg: false },
    { name: 'Baingan Bharta', description: 'Smoky roasted eggplant mashed and cooked with onions, tomatoes, and spices', price: 220, categoryId: curry.id, isVeg: true },

    // Breads
    { name: 'Butter Naan', description: 'Soft leavened bread brushed with butter, baked in tandoor', price: 60, categoryId: bread.id, isVeg: true },
    { name: 'Garlic Naan', description: 'Naan studded with fresh garlic and cilantro', price: 70, categoryId: bread.id, isVeg: true },
    { name: 'Roomali Roti', description: 'Paper-thin handkerchief bread folded and served hot', price: 50, categoryId: bread.id, isVeg: true },
    { name: 'Lachha Paratha', description: 'Flaky multi-layered whole wheat bread with ghee', price: 60, categoryId: bread.id, isVeg: true },
    { name: 'Keema Naan', description: 'Naan stuffed with spiced minced mutton', price: 90, categoryId: bread.id, isVeg: false },
    { name: 'Missi Roti', description: 'Gram flour flatbread with ajwain seeds and spices', price: 55, categoryId: bread.id, isVeg: true },

    // Rice & Dal
    { name: 'Jeera Rice', description: 'Basmati rice tempered with cumin seeds and ghee', price: 160, categoryId: rice.id, isVeg: true },
    { name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin, garlic, and ghee', price: 180, categoryId: rice.id, isVeg: true },
    { name: 'Dal Fry', description: 'Mixed lentils cooked with tomatoes, onions, and spices', price: 180, categoryId: rice.id, isVeg: true },
    { name: 'Steam Rice', description: 'Plain steamed basmati rice', price: 120, categoryId: rice.id, isVeg: true },

    // Desserts
    { name: 'Double Ka Meetha', description: 'Hyderabadi bread pudding soaked in saffron milk, garnished with pistachios', price: 160, categoryId: dessert.id, isVeg: true },
    { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup', price: 120, categoryId: dessert.id, isVeg: true },
    { name: 'Kulfi Falooda', description: 'Traditional Indian ice cream with rose syrup, basil seeds, and vermicelli', price: 150, categoryId: dessert.id, isVeg: true },
    { name: 'Phirni', description: 'Creamy ground rice pudding flavoured with cardamom and saffron', price: 130, categoryId: dessert.id, isVeg: true },
    { name: 'Jalebi', description: 'Crispy spirals deep-fried and soaked in warm saffron syrup', price: 100, categoryId: dessert.id, isVeg: true },

    // Beverages
    { name: 'Masala Chai', description: 'Strong Assam tea brewed with ginger, cardamom, and cinnamon', price: 40, categoryId: beverage.id, isVeg: true },
    { name: 'Mango Lassi', description: 'Thick and creamy Alphonso mango yoghurt shake', price: 90, categoryId: beverage.id, isVeg: true },
    { name: 'Sweet Lassi', description: 'Refreshing chilled yoghurt drink sweetened with sugar', price: 70, categoryId: beverage.id, isVeg: true },
    { name: 'Nimbu Pani', description: 'Freshly squeezed lemon water with a pinch of cumin and black salt', price: 40, categoryId: beverage.id, isVeg: true },
    { name: 'Cold Coffee', description: 'Iced coffee blended with milk, chocolate, and vanilla', price: 110, categoryId: beverage.id, isVeg: true },
    { name: 'Thandai', description: 'Chilled spiced milk with almonds, saffron, and fennel seeds', price: 100, categoryId: beverage.id, isVeg: true },
    { name: 'Fresh Lime Soda', description: 'Lime soda — sweet or salty, your choice', price: 50, categoryId: beverage.id, isVeg: true },
    { name: 'Rooh Afza', description: 'Classic rose and herb syrup blended with chilled milk', price: 60, categoryId: beverage.id, isVeg: true },
  ];

  await prisma.menuItem.createMany({
    data: items.map(item => ({
      ...item,
      restaurantId: restaurant.id,
      isAvailable: true,
    })),
  });

  // Update category item counts
  for (const cat of cats) {
    const count = await prisma.menuItem.count({ where: { categoryId: cat.id } });
    await prisma.category.update({ where: { id: cat.id }, data: { itemCount: count } });
  }

  // ── Tables ──
  const tableSeed = [
    { number: 1, seats: 2, status: 'available' },
    { number: 2, seats: 2, status: 'available' },
    { number: 3, seats: 4, status: 'occupied' },
    { number: 4, seats: 4, status: 'available' },
    { number: 5, seats: 4, status: 'available' },
    { number: 6, seats: 6, status: 'reserved' },
    { number: 7, seats: 6, status: 'available' },
    { number: 8, seats: 2, status: 'occupied' },
    { number: 9, seats: 4, status: 'available' },
    { number: 10, seats: 8, status: 'available' },
    { number: 11, seats: 2, status: 'available' },
    { number: 12, seats: 4, status: 'cleaning' },
    { number: 13, seats: 6, status: 'available' },
    { number: 14, seats: 2, status: 'available' },
    { number: 15, seats: 10, status: 'available' },
  ];

  await prisma.table.createMany({
    data: tableSeed.map(t => ({ ...t, restaurantId: restaurant.id })),
  });

  // ── Demo customer ──
  const customerHash = await bcrypt.hash('password123', 10);
  await prisma.customer.create({
    data: { name: 'Arjun Reddy', email: 'arjun@customer.com', phone: '+91 98765 43210', password: customerHash, points: 180, totalSpent: 2450, visitCount: 5, restaurantId: restaurant.id },
  });

  return restaurant;
}

// ── Helper: get or create restaurant ────────────────────────────
async function ensureRestaurant() {
  const r = await prisma.restaurant.findFirst();
  if (r) return r;
  return seedDefaultData();
}

// ════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    restaurantName: z.string().min(2),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }
  const restaurant = await prisma.restaurant.create({
    data: {
      name: parsed.data.restaurantName,
      slug: parsed.data.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: 'New restaurant',
    },
  });
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: pw, role: 'owner', restaurantId: restaurant.id },
  });
  return res.status(201).json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug }, token: 'dev-token', refreshToken: 'dev-refresh-token' },
  });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const restaurant = user.restaurantId ? await prisma.restaurant.findUnique({ where: { id: user.restaurantId } }) : null;
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId },
      restaurant: restaurant ? { id: restaurant.id, name: restaurant.name, slug: restaurant.slug } : null,
      token: 'dev-token', refreshToken: 'dev-refresh-token',
    },
  });
}));

// ════════════════════════════════════════════════════════════════
//  CUSTOMER AUTH
// ════════════════════════════════════════════════════════════════

app.post('/api/customer/register', asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ success: false, message: 'Account already exists' });
  const restaurant = await ensureRestaurant();
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const customer = await prisma.customer.create({
    data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, password: pw, restaurantId: restaurant.id },
  });
  return res.status(201).json({
    success: true,
    data: { customer: { id: customer.id, name: customer.name, email: customer.email, points: customer.points }, token: 'dev-customer-token' },
  });
}));

app.post('/api/customer/login', asyncHandler(async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (!customer) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await bcrypt.compare(parsed.data.password, customer.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  return res.json({
    success: true,
    data: { user: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, role: 'customer', points: customer.points, totalSpent: customer.totalSpent, visitCount: customer.visitCount }, token: 'dev-customer-token' },
  });
}));

app.get('/api/customer/me', asyncHandler(async (req, res) => {
  // In production this would use JWT middleware; for dev, query by email header or first customer
  const customers = await prisma.customer.findMany({ include: { orders: { include: { items: true }, orderBy: { createdAt: 'desc' } }, reservations: { orderBy: { createdAt: 'desc' } } } });
  if (customers.length === 0) return res.status(404).json({ success: false, message: 'No customer found' });
  const c = customers[0];
  return res.json({
    success: true,
    data: { id: c.id, name: c.name, email: c.email, phone: c.phone, points: c.points, totalSpent: c.totalSpent, visitCount: c.visitCount, orders: c.orders, reservations: c.reservations },
  });
}));

// ════════════════════════════════════════════════════════════════
//  RESTAURANT & ONBOARDING
// ════════════════════════════════════════════════════════════════

app.get('/api/restaurant', asyncHandler(async (_req, res) => {
  const restaurant = await ensureRestaurant();
  res.json({ success: true, data: restaurant });
}));

app.get('/api/onboarding/status', asyncHandler(async (_req, res) => {
  const restaurant = await ensureRestaurant();
  const settings = parseJsonValue(restaurant.settings);
  return res.json({ success: true, data: { restaurant, onboarding: settings.onboarding || {} } });
}));

app.post('/api/onboarding/restaurant', asyncHandler(async (req, res) => {
  const restaurant = await ensureRestaurant();
  const settings = parseJsonValue(restaurant.settings);
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: req.body.name || restaurant.name,
      description: req.body.description || restaurant.description,
      phone: req.body.phone || restaurant.phone,
      email: req.body.email || restaurant.email,
      address: req.body.address || restaurant.address,
      settings: JSON.stringify({ ...settings, onboarding: { ...((settings as any).onboarding || {}), restaurant: req.body } }),
    },
  });
  return res.json({ success: true, data: updated });
}));

app.post('/api/onboarding/branch', asyncHandler(async (req, res) => {
  const restaurant = await ensureRestaurant();
  const settings = parseJsonValue(restaurant.settings);
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify({ ...settings, onboarding: { ...((settings as any).onboarding || {}), branch: req.body } }) },
  });
  return res.json({ success: true, data: updated });
}));

app.post('/api/onboarding/tables', asyncHandler(async (req, res) => {
  const restaurant = await ensureRestaurant();
  const tables = Array.isArray(req.body.tables) ? req.body.tables : [];

  // Get existing table numbers to avoid unique constraint violations
  const existingTables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    select: { number: true },
  });
  const existingNumbers = new Set(existingTables.map(t => t.number));

  // Only create tables with numbers that don't already exist
  const tablesToCreate = tables.filter((t: any) => !existingNumbers.has(Number(t.number)));
  const skippedCount = tables.length - tablesToCreate.length;

  const created = tablesToCreate.length > 0
    ? await Promise.all(tablesToCreate.map((t: any) => prisma.table.create({
        data: { restaurantId: restaurant.id, number: Number(t.number), seats: Number(t.seats), status: t.status || 'available' },
      })))
    : [];

  return res.json({ success: true, data: { created, skipped: skippedCount } });
}));

app.post('/api/onboarding/menu', asyncHandler(async (req, res) => {
  const restaurant = await ensureRestaurant();
  return res.json({ success: true, data: { message: 'Menu seeded via seedDefaultData' } });
}));

app.post('/api/onboarding/payments', asyncHandler(async (req, res) => {
  const restaurant = await ensureRestaurant();
  const settings = parseJsonValue(restaurant.settings);
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify({ ...settings, onboarding: { ...((settings as any).onboarding || {}), payments: req.body } }) },
  });
  return res.json({ success: true, data: updated });
}));

app.post('/api/onboarding/complete', asyncHandler(async (req, res) => {
  const restaurant = await ensureRestaurant();
  const settings = parseJsonValue(restaurant.settings);
  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify({ ...settings, onboarding: { ...((settings as any).onboarding || {}), completed: true, completedAt: new Date().toISOString() } }) },
  });
  return res.json({ success: true, data: updated });
}));

// ════════════════════════════════════════════════════════════════
//  CATEGORIES & MENU
// ════════════════════════════════════════════════════════════════

app.get('/api/categories', asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  res.json({ success: true, data: categories });
}));

app.post('/api/categories', asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(1), slug: z.string().min(1).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const restaurant = await ensureRestaurant();
  const newCat = await prisma.category.create({
    data: { name: parsed.data.name, slug: parsed.data.slug || parsed.data.name.toLowerCase().replace(/\s+/g, '-'), itemCount: 0, order: (await prisma.category.count({ where: { restaurantId: restaurant.id } })) + 1, restaurantId: restaurant.id },
  });
  return res.status(201).json({ success: true, data: newCat });
}));

app.put('/api/categories/:id', asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  const updated = await prisma.category.update({ where: { id: cat.id }, data: { name: req.body.name || cat.name, slug: req.body.slug || cat.slug } });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/categories/:id', asyncHandler(async (req, res) => {
  const cat = await prisma.category.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  await prisma.category.delete({ where: { id: cat.id } });
  return res.json({ success: true, data: { id: cat.id } });
}));

app.get('/api/menu-items', asyncHandler(async (_req, res) => {
  const items = await prisma.menuItem.findMany({ orderBy: { createdAt: 'asc' } });
  res.json({ success: true, data: items });
}));

app.post('/api/menu-items', asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(1), description: z.string().min(1), price: z.number().min(0), categoryId: z.string().min(1), isVeg: z.boolean().optional(), isAvailable: z.boolean().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const restaurant = await ensureRestaurant();
  const item = await prisma.menuItem.create({
    data: { name: parsed.data.name, description: parsed.data.description, price: parsed.data.price, categoryId: parsed.data.categoryId, restaurantId: restaurant.id, isVeg: parsed.data.isVeg ?? true, isAvailable: parsed.data.isAvailable ?? true },
  });
  return res.status(201).json({ success: true, data: item });
}));

app.put('/api/menu-items/:id', asyncHandler(async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  const updated = await prisma.menuItem.update({ where: { id: item.id }, data: req.body });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/menu-items/:id', asyncHandler(async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  await prisma.menuItem.delete({ where: { id: item.id } });
  return res.json({ success: true, data: { id: item.id } });
}));

// ════════════════════════════════════════════════════════════════
//  TABLES
// ════════════════════════════════════════════════════════════════

app.get('/api/tables', asyncHandler(async (_req, res) => {
  const tables = await prisma.table.findMany({ orderBy: { number: 'asc' } });
  res.json({ success: true, data: tables });
}));

app.post('/api/tables', asyncHandler(async (req, res) => {
  const schema = z.object({ number: z.number().int().positive(), seats: z.number().int().positive(), status: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const restaurant = await ensureRestaurant();
  const table = await prisma.table.create({ data: { number: parsed.data.number, seats: parsed.data.seats, status: parsed.data.status || 'available', restaurantId: restaurant.id } });
  return res.status(201).json({ success: true, data: table });
}));

app.put('/api/tables/:id', asyncHandler(async (req, res) => {
  const table = await prisma.table.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
  const updated = await prisma.table.update({ where: { id: table.id }, data: req.body });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/tables/:id', asyncHandler(async (req, res) => {
  const table = await prisma.table.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
  await prisma.table.delete({ where: { id: table.id } });
  return res.json({ success: true, data: { id: table.id } });
}));

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════

app.get('/api/orders', asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: orders });
}));

app.get('/api/orders/:id', asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: paramStr(req.params.id) }, include: { items: true } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  return res.json({ success: true, data: order });
}));

app.post('/api/orders', asyncHandler(async (req, res) => {
  try {
    // Accept restaurantId but auto-resolve if missing/invalid
    let restaurantId = req.body.restaurantId;
    let restaurant;
    if (restaurantId) {
      restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    }
    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst();
    }
    if (!restaurant) {
      return res.status(400).json({ success: false, message: 'No restaurant configured. Please restart the server.' });
    }

    const tableNumber = Number(req.body.tableNumber);
    const customerName = String(req.body.customerName || 'Guest');
    const itemsInput = Array.isArray(req.body.items) ? req.body.items : [];

    if (!tableNumber || tableNumber < 1) {
      return res.status(400).json({ success: false, message: 'Valid table number is required' });
    }
    if (itemsInput.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    // Resolve menu items from DB — each entry has { itemId, quantity }
    const resolvedItems: { menuItemId: string; quantity: number; price: number; name: string }[] = [];
    for (const entry of itemsInput) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: entry.itemId } });
      if (menuItem) {
        resolvedItems.push({ menuItemId: menuItem.id, quantity: entry.quantity, price: menuItem.price, name: menuItem.name });
      } else {
        // Item not found in DB — use a fallback with name from request if provided
        resolvedItems.push({ menuItemId: '', quantity: entry.quantity, price: 0, name: entry.name || 'Unknown Item' });
      }
    }

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * 0.05; // 5% GST in India
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        tableNumber,
        customerName,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: resolvedItems.map(i => ({
            itemId: i.menuItemId || null,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
    });

    io.emit('order:new', order);
    return res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    console.error('[POST /api/orders] Error:', err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to create order' });
  }
}));

app.put('/api/orders/:id/status', asyncHandler(async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: paramStr(req.params.id) } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const allowed = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'PAYMENT_PENDING', 'PAID', 'COMPLETED', 'CANCELLED'];
    const nextStatus = req.body.status;
    if (!allowed.includes(nextStatus)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const transitionMap: Record<string, string[]> = {
      PENDING: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED', 'CANCELLED'],
      SERVED: ['PAYMENT_PENDING', 'CANCELLED'],
      PAYMENT_PENDING: ['PAID', 'CANCELLED'],
      PAID: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (!transitionMap[order.status]?.includes(nextStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: nextStatus, paymentStatus: ['PAID', 'COMPLETED'].includes(nextStatus) ? 'PAID' : order.paymentStatus },
      include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
    });
    io.emit('order:update', updated);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('[PUT /api/orders/:id/status] Error:', err?.message || err);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
}));

// ════════════════════════════════════════════════════════════════
//  STAFF / WAITERS
// ════════════════════════════════════════════════════════════════

app.get('/api/waiters', asyncHandler(async (_req, res) => {
  const waiters = await prisma.user.findMany({ where: { role: { in: ['waiter', 'chef'] } }, select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
  res.json({ success: true, data: waiters });
}));

app.post('/api/waiters', asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8).optional(), role: z.enum(['waiter', 'chef']).default('waiter') });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists' });
  const restaurant = await ensureRestaurant();
  const pw = await bcrypt.hash(parsed.data.password || 'password123', 10);
  const waiter = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: pw, role: parsed.data.role, restaurantId: restaurant.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  io.emit('waiter:new', waiter);
  return res.status(201).json({ success: true, data: waiter });
}));

app.delete('/api/waiters/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' });
  if (user.role === 'owner') return res.status(400).json({ success: false, message: 'Cannot remove the owner' });
  await prisma.order.updateMany({ where: { claimedById: paramStr(req.params.id) }, data: { claimedById: null } });
  await prisma.user.delete({ where: { id: paramStr(req.params.id) } });
  return res.json({ success: true, data: { id: paramStr(req.params.id) } });
}));

// ── Order claiming ──
app.put('/api/orders/:id/claim', asyncHandler(async (req, res) => {
  try {
    const schema = z.object({ waiterId: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'waiterId is required' });
    const order = await prisma.order.findUnique({ where: { id: paramStr(req.params.id) } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.claimedById && order.claimedById !== parsed.data.waiterId) {
      return res.status(409).json({ success: false, message: 'Order already claimed by another waiter' });
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { claimedById: parsed.data.waiterId, status: order.status === 'PENDING' ? 'ACCEPTED' : order.status },
      include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
    });
    io.emit('order:update', updated);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to claim order' });
  }
}));

app.put('/api/orders/:id/release', asyncHandler(async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: paramStr(req.params.id) } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { claimedById: null, status: order.status === 'ACCEPTED' ? 'PENDING' : order.status },
      include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
    });
    io.emit('order:update', updated);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to release order' });
  }
}));

// ── Waiter stats ──
app.get('/api/stats/waiters', asyncHandler(async (_req, res) => {
  const waiters = await prisma.user.findMany({ where: { role: 'waiter' }, select: { id: true, name: true, email: true } });
  const stats = await Promise.all(waiters.map(async (w) => {
    const claimed = await prisma.order.findMany({ where: { claimedById: w.id } });
    const fulfilled = claimed.filter(o => ['SERVED', 'PAID', 'COMPLETED'].includes(o.status));
    const active = claimed.filter(o => !['SERVED', 'PAID', 'COMPLETED', 'CANCELLED'].includes(o.status));
    const revenue = fulfilled.reduce((s, o) => s + o.total, 0);
    return { id: w.id, name: w.name, email: w.email, claimed: claimed.length, fulfilled: fulfilled.length, active: active.length, revenue: Math.round(revenue * 100) / 100 };
  }));
  stats.sort((a, b) => b.fulfilled - a.fulfilled);
  return res.json({ success: true, data: stats });
}));

// ════════════════════════════════════════════════════════════════
//  RESERVATIONS
// ════════════════════════════════════════════════════════════════

app.get('/api/reservations', asyncHandler(async (_req, res) => {
  const reservations = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: reservations });
}));

app.post('/api/reservations', asyncHandler(async (req, res) => {
  try {
    const restaurant = await ensureRestaurant();
    const { customerName, phone, email, partySize, date, time, notes, customerId } = req.body;
    if (!customerName || !partySize || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing required fields: customerName, partySize, date, time' });
    }
    const reservation = await prisma.reservation.create({
      data: {
        restaurantId: restaurant.id,
        customerId: customerId || null,
        customerName,
        phone: phone || null,
        email: email || null,
        partySize: Number(partySize),
        date,
        time,
        notes: notes || null,
        status: 'PENDING',
      },
    });
    return res.status(201).json({ success: true, data: reservation });
  } catch (err: any) {
    console.error('[POST /api/reservations] Error:', err?.message || err);
    return res.status(500).json({ success: false, message: 'Failed to create reservation' });
  }
}));

app.put('/api/reservations/:id/status', asyncHandler(async (req, res) => {
  try {
    const reservation = await prisma.reservation.findUnique({ where: { id: paramStr(req.params.id) } });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    const updated = await prisma.reservation.update({ where: { id: reservation.id }, data: { status: req.body.status } });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update reservation' });
  }
}));

// ════════════════════════════════════════════════════════════════
//  PAYMENTS
// ════════════════════════════════════════════════════════════════

app.post('/api/payments/create', asyncHandler(async (req, res) => {
  try {
    const schema = z.object({ orderId: z.string(), amount: z.number().positive(), method: z.enum(['online', 'counter', 'card', 'cash', 'mobile']) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const payment = await prisma.payment.create({
      data: { orderId: order.id, amount: parsed.data.amount, method: parsed.data.method, status: parsed.data.method === 'counter' || parsed.data.method === 'cash' ? 'PAID' : 'PENDING' },
    });
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: payment.status === 'PAID' ? 'PAID' : 'PENDING', status: payment.status === 'PAID' ? 'COMPLETED' : order.status },
    });
    io.emit('payment:update', { ...payment, order: updatedOrder });
    return res.json({ success: true, data: payment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create payment' });
  }
}));

app.get('/api/payments', asyncHandler(async (_req, res) => {
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: payments });
}));

// ════════════════════════════════════════════════════════════════
//  AUTH: Profile, Staff management, Dashboard stats, Customers
// ════════════════════════════════════════════════════════════════

app.get('/api/auth/profile', asyncHandler(async (req, res) => {
  const tokenUser = req.headers.authorization?.replace('Bearer ', '');
  const users = await prisma.user.findMany();
  if (users.length === 0) return res.status(404).json({ success: false, message: 'No user found' });
  const user = users[0];
  const restaurant = user.restaurantId ? await prisma.restaurant.findUnique({ where: { id: user.restaurantId } }) : null;
  return res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId }, restaurant } });
}));

app.put('/api/auth/profile', asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany();
  if (users.length === 0) return res.status(404).json({ success: false, message: 'No user found' });
  const user = users[0];
  const updated = await prisma.user.update({ where: { id: user.id }, data: { name: req.body.name || user.name, email: req.body.email || user.email } });
  return res.json({ success: true, data: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
}));

app.post('/api/auth/register-staff', asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), role: z.enum(['waiter', 'chef']).default('waiter') });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists' });
  const restaurant = await ensureRestaurant();
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const waiter = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: pw, role: parsed.data.role, restaurantId: restaurant.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  io.emit('waiter:new', waiter);
  return res.status(201).json({ success: true, data: waiter });
}));

app.get('/api/auth/staff', asyncHandler(async (_req, res) => {
  const staff = await prisma.user.findMany({ where: { role: { in: ['waiter', 'chef'] } }, select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'asc' } });
  res.json({ success: true, data: staff });
}));

app.delete('/api/auth/staff/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' });
  if (user.role === 'owner') return res.status(400).json({ success: false, message: 'Cannot remove the owner' });
  await prisma.order.updateMany({ where: { claimedById: paramStr(req.params.id) }, data: { claimedById: null } });
  await prisma.user.delete({ where: { id: paramStr(req.params.id) } });
  return res.json({ success: true, data: { id: paramStr(req.params.id) } });
}));

app.get('/api/auth/dashboard-stats', asyncHandler(async (_req, res) => {
  const restaurant = await getRestaurant();
  if (!restaurant) return res.json({ success: true, data: { totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalMenuItems: 0, activeTables: 0, pendingOrders: 0, todayOrders: 0, todayRevenue: 0 } });
  const totalOrders = await prisma.order.count({ where: { restaurantId: restaurant.id } });
  const totalRevenue = await prisma.order.aggregate({ where: { restaurantId: restaurant.id, paymentStatus: 'PAID' }, _sum: { total: true } });
  const totalCustomers = await prisma.customer.count({ where: { restaurantId: restaurant.id } });
  const totalMenuItems = await prisma.menuItem.count({ where: { restaurantId: restaurant.id } });
  const activeTables = await prisma.table.count({ where: { restaurantId: restaurant.id, status: 'available' } });
  const pendingOrders = await prisma.order.count({ where: { restaurantId: restaurant.id, status: 'PENDING' } });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = await prisma.order.count({ where: { restaurantId: restaurant.id, createdAt: { gte: today } } });
  const todayRevenue = await prisma.order.aggregate({ where: { restaurantId: restaurant.id, paymentStatus: 'PAID', createdAt: { gte: today } }, _sum: { total: true } });
  return res.json({ success: true, data: { totalOrders, totalRevenue: totalRevenue._sum.total || 0, totalCustomers, totalMenuItems, activeTables, pendingOrders, todayOrders, todayRevenue: todayRevenue._sum.total || 0 } });
}));

app.get('/api/auth/customers', asyncHandler(async (_req, res) => {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: customers });
}));

app.post('/api/auth/register-customer', asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ success: false, message: 'Account already exists' });
  const restaurant = await ensureRestaurant();
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const customer = await prisma.customer.create({
    data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, password: pw, restaurantId: restaurant.id },
  });
  return res.status(201).json({ success: true, data: { user: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, role: 'customer' }, token: 'dev-customer-token' } });
}));

// ════════════════════════════════════════════════════════════════
//  RESTAURANTS (plural API for frontend compatibility)
// ════════════════════════════════════════════════════════════════

app.get('/api/restaurants', asyncHandler(async (_req, res) => {
  const restaurants = await prisma.restaurant.findMany();
  res.json({ success: true, data: restaurants });
}));

app.get('/api/restaurants/slug/:slug', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: paramStr(req.params.slug) } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  res.json({ success: true, data: restaurant });
}));

app.get('/api/restaurants/:id', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  res.json({ success: true, data: restaurant });
}));

app.put('/api/restaurants/:id', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const updated = await prisma.restaurant.update({ where: { id: restaurant.id }, data: { name: req.body.name || restaurant.name, description: req.body.description || restaurant.description, phone: req.body.phone || restaurant.phone, email: req.body.email || restaurant.email, address: req.body.address || restaurant.address, settings: req.body.settings ? JSON.stringify(req.body.settings) : restaurant.settings } });
  res.json({ success: true, data: updated });
}));

// ════════════════════════════════════════════════════════════════
//  COUNT ENDPOINTS (for onboarding)
// ════════════════════════════════════════════════════════════════

app.get('/api/categories/count', asyncHandler(async (_req, res) => {
  const count = await prisma.category.count();
  res.json({ success: true, data: count });
}));

app.get('/api/menu-items/count', asyncHandler(async (_req, res) => {
  const count = await prisma.menuItem.count();
  res.json({ success: true, data: count });
}));

app.get('/api/tables/count', asyncHandler(async (_req, res) => {
  const count = await prisma.table.count();
  res.json({ success: true, data: count });
}));

app.get('/api/menu-items/:id', asyncHandler(async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  res.json({ success: true, data: item });
}));

// ════════════════════════════════════════════════════════════════
//  TABLES BULK
// ════════════════════════════════════════════════════════════════

app.post('/api/tables/bulk', asyncHandler(async (req, res) => {
  const restaurant = await ensureRestaurant();
  const tables = Array.isArray(req.body.tables) ? req.body.tables : [];
  const existingTables = await prisma.table.findMany({ where: { restaurantId: restaurant.id }, select: { number: true } });
  const existingNumbers = new Set(existingTables.map(t => t.number));
  const tablesToCreate = tables.filter((t: any) => !existingNumbers.has(Number(t.number)));
  const created = tablesToCreate.length > 0
    ? await Promise.all(tablesToCreate.map((t: any) => prisma.table.create({
        data: { restaurantId: restaurant.id, number: Number(t.number), seats: Number(t.seats), status: t.status || 'available' },
      })))
    : [];
  return res.json({ success: true, data: created });
}));

// ════════════════════════════════════════════════════════════════
//  RESERVATIONS: full CRUD
// ════════════════════════════════════════════════════════════════

app.put('/api/reservations/:id', asyncHandler(async (req, res) => {
  const reservation = await prisma.reservation.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
  const updated = await prisma.reservation.update({ where: { id: reservation.id }, data: { status: req.body.status || reservation.status, customerName: req.body.customerName || reservation.customerName, partySize: req.body.partySize || reservation.partySize, date: req.body.date || reservation.date, time: req.body.time || reservation.time, notes: req.body.notes ?? reservation.notes } });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/reservations/:id', asyncHandler(async (req, res) => {
  const reservation = await prisma.reservation.findUnique({ where: { id: paramStr(req.params.id) } });
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
  await prisma.reservation.delete({ where: { id: reservation.id } });
  return res.json({ success: true, data: { id: reservation.id } });
}));

// ════════════════════════════════════════════════════════════════
//  PUBLIC MENU (no auth required)
// ════════════════════════════════════════════════════════════════

app.get('/api/public/menu/:slug', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: paramStr(req.params.slug) } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const categories = await prisma.category.findMany({ where: { restaurantId: restaurant.id }, orderBy: { order: 'asc' } });
  const menuItems = await prisma.menuItem.findMany({ where: { restaurantId: restaurant.id, isAvailable: true }, orderBy: { createdAt: 'asc' } });
  const tables = await prisma.table.findMany({ where: { restaurantId: restaurant.id }, orderBy: { number: 'asc' } });
  return res.json({ success: true, data: { restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug, description: restaurant.description, address: restaurant.address, phone: restaurant.phone, openingHours: restaurant.openingHours }, categories, menuItems, tables } });
}));

app.get('/api/public/menu/:slug/item/:itemId', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: paramStr(req.params.slug) } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const item = await prisma.menuItem.findUnique({ where: { id: paramStr(req.params.itemId) } });
  if (!item || item.restaurantId !== restaurant.id) return res.status(404).json({ success: false, message: 'Item not found' });
  const category = await prisma.category.findUnique({ where: { id: item.categoryId } });
  return res.json({ success: true, data: { ...item, category } });
}));

// ════════════════════════════════════════════════════════════════
//  RAZORPAY (stubs — implement with real keys)
// ════════════════════════════════════════════════════════════════

app.post('/api/payments/create-order', asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: 'Razorpay keys not configured on server' });
  }
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: orderId,
    });
    return res.json({ success: true, data: { razorpayOrderId: razorpayOrder.id, orderId: razorpayOrder.id, keyId: process.env.RAZORPAY_KEY_ID, amount: razorpayOrder.amount, currency: razorpayOrder.currency } });
  } catch (rpErr: any) {
    console.error('[Razorpay] create-order failed:', rpErr?.error || rpErr?.message || rpErr);
    return res.status(500).json({ success: false, message: `Razorpay error: ${rpErr?.error?.description || rpErr?.message || 'Unknown error'}` });
  }
}));

app.post('/api/payments/verify', asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: 'Razorpay keys not configured' });
  }
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  const isValid = expectedSignature === razorpay_signature;
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  await prisma.payment.create({ data: { orderId, amount: order.total, method: 'online', status: 'PAID' } });
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'PAID', status: 'COMPLETED' } });
  return res.json({ success: true, data: { verified: true } });
}));

// ════════════════════════════════════════════════════════════════
//  FEEDBACK / REVIEWS
// ════════════════════════════════════════════════════════════════

app.get('/api/feedback', asyncHandler(async (_req, res) => {
  res.json({ success: true, data: [] });
}));

app.post('/api/feedback', asyncHandler(async (req, res) => {
  return res.status(201).json({ success: true, data: { id: 'feedback-' + Date.now(), ...req.body, createdAt: new Date().toISOString() } });
}));

app.put('/api/feedback/:id/reply', asyncHandler(async (req, res) => {
  return res.json({ success: true, data: { id: paramStr(req.params.id), reply: req.body.reply } });
}));

// ════════════════════════════════════════════════════════════════
//  SOCKET.IO
// ════════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  socket.on('join:restaurant', (restaurantId: string) => {
    socket.join(restaurantId);
  });
});

// ── Global error handler ─────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]', err?.message || err);
  if (err?.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ success: false, message: 'Database error', detail: err.message });
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Process crash handlers ──────────────────────────────────────
process.on('unhandledRejection', (reason: any) => {
  console.error('[Unhandled Rejection]', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err.message);
});

// ── Start ───────────────────────────────────────────────────────
async function startServer() {
  await prisma.$connect();
  await seedDefaultData();
  const port = Number(process.env.PORT || 5000);
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`SERVORA backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
