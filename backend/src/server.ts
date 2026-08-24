import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import Razorpay from 'razorpay';
import { prisma } from './lib/prisma.js';

// ── Environment validation ──────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || '';
if (process.env.NODE_ENV === 'production' && JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET env var must be set to at least 32 random characters in production.');
  console.error('Generate one with: openssl rand -hex 48');
  process.exit(1);
}
const SECRET = JWT_SECRET || 'insecure-dev-secret-do-not-use-in-production';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const app = express();
const httpServer = createServer(app);

// Behind Render's proxy so req.ip reflects the real client IP
app.set('trust proxy', 1);

// ── CORS ────────────────────────────────────────────────────────
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

// ── Socket.IO (authenticated, room-scoped) ──────────────────────
interface AuthPayload {
  sub: string;
  role?: string;
  restaurantId?: string | null;
  type: 'staff' | 'customer';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.use((socket: Socket, next) => {
  try {
    const raw = socket.handshake.auth?.token;
    if (!raw) return next(new Error('unauthorized'));
    const token = String(raw).replace(/^Bearer\s+/i, '');
    const payload = jwt.verify(token, SECRET) as AuthPayload;
    socket.data.auth = payload;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket: Socket) => {
  const rid = socket.data.auth?.restaurantId;
  if (rid) socket.join(rid);
});

function emitToRestaurant(restaurantId: string | null | undefined, event: string, payload: unknown) {
  if (!restaurantId) return;
  io.to(restaurantId).emit(event, payload);
}

// ── Middleware ──────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

// ── Rate limiting ───────────────────────────────────────────────
const generalLimiter = new RateLimiterMemory({ points: 240, duration: 60 });
const authLimiter = new RateLimiterMemory({ points: 10, duration: 60 });
const writeLimiter = new RateLimiterMemory({ points: 30, duration: 60 });

function limit(limiter: RateLimiterMemory) {
  return (_req: Request, res: Response, next: NextFunction) => {
    limiter.consume(_req.ip ?? 'unknown')
      .then(() => next())
      .catch(() => res.status(429).json({ success: false, message: 'Too many requests. Please slow down.' }));
  };
}

app.use(limit(generalLimiter));

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'SERVORA backend is running' });
});

// ── Helpers ─────────────────────────────────────────────────────
function parseJsonValue(value: string | null | undefined) {
  if (!value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function paramStr(val: unknown): string {
  return Array.isArray(val) ? val[0] : String(val);
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ── Token signing ───────────────────────────────────────────────
function signStaffToken(user: { id: string; role: string; restaurantId: string | null }) {
  return jwt.sign(
    { sub: user.id, role: user.role, restaurantId: user.restaurantId, type: 'staff' },
    SECRET,
    { expiresIn: '12h' }
  );
}

function signRefreshToken(payload: AuthPayload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

function signCustomerToken(customer: { id: string; restaurantId: string | null }) {
  return jwt.sign(
    { sub: customer.id, restaurantId: customer.restaurantId, type: 'customer' },
    SECRET,
    { expiresIn: '30d' }
  );
}

// ── Auth guards ─────────────────────────────────────────────────
function requireAuth(type?: 'staff' | 'customer') {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    try {
      const payload = jwt.verify(header.slice(7), SECRET) as AuthPayload;
      if (type && payload.type !== type) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      req.auth = payload;
      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
  };
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || req.auth.type !== 'staff' || !roles.includes(req.auth.role || '')) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

function requireStaffRestaurant(req: Request, res: Response): string | null {
  const rid = req.auth?.restaurantId;
  if (!rid) {
    res.status(403).json({ success: false, message: 'No restaurant associated with this account' });
    return null;
  }
  return rid;
}

// Public-safe restaurant fields
const publicRestaurantFields = {
  id: true, name: true, slug: true, description: true, address: true,
  phone: true, email: true, openingHours: true,
};

// ════════════════════════════════════════════════════════════════
//  SEED: Hotel Siraj demo content (idempotent + self-healing)
// ════════════════════════════════════════════════════════════════

async function seedRestaurantContent(restaurantId: string) {
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
  const cats: { id: string }[] = [];
  for (const c of catData) {
    const existing = await prisma.category.findUnique({
      where: { restaurantId_slug: { restaurantId, slug: c.slug } },
    });
    if (existing) { cats.push(existing); continue; }
    cats.push(await prisma.category.create({
      data: { ...c, itemCount: 0, restaurantId },
    }));
  }
  const [starter, biryani, tandoor, curry, bread, rice, dessert, beverage] = cats;

  // ── Menu Items (₹ pricing) ──
  const items = [
    { name: 'Chicken 65', description: 'Spicy deep-fried chicken tossed with curry leaves, red chillies, and a hint of lemon', price: 280, categoryId: starter.id, isVeg: false },
    { name: 'Paneer Tikka', description: 'Chargrilled cottage cheese cubes marinated in hung curd and secret spices', price: 260, categoryId: starter.id, isVeg: true },
    { name: 'Mutton Seekh Kebab', description: 'Minced mutton skewers grilled in tandoor with fresh herbs and spices', price: 340, categoryId: starter.id, isVeg: false },
    { name: 'Veg Spring Rolls', description: 'Crunchy rolls stuffed with mixed vegetables and glass noodles', price: 180, categoryId: starter.id, isVeg: true },
    { name: 'Fish Amritsari', description: 'Batter-fried river fish fillets with tangy tamarind chutney', price: 320, categoryId: starter.id, isVeg: false },
    { name: 'Hara Bhara Kebab', description: 'Spinach and green pea patties with paneer, pan-fried to perfection', price: 200, categoryId: starter.id, isVeg: true },
    { name: 'Hyderabadi Mutton Biryani', description: 'Our legendary slow-cooked dum biryani with tender mutton, saffron, and fried onions', price: 420, categoryId: biryani.id, isVeg: false },
    { name: 'Chicken Dum Biryani', description: 'Fragrant basmati rice layered with spiced chicken, sealed and cooked on dum', price: 350, categoryId: biryani.id, isVeg: false },
    { name: 'Veg Biryani', description: 'Garden vegetables slow-cooked with aromatic rice and whole spices', price: 280, categoryId: biryani.id, isVeg: true },
    { name: 'Mutton Bone Marrow Biryani', description: 'Special cut mutton biryani with rich marrow gravy on the side', price: 520, categoryId: biryani.id, isVeg: false },
    { name: 'Egg Biryani', description: 'Boiled eggs layered with spiced rice and caramelized onions', price: 250, categoryId: biryani.id, isVeg: false },
    { name: 'Tandoori Chicken', description: 'Whole chicken leg marinated overnight in yogurt and spices, roasted in clay oven', price: 380, categoryId: tandoor.id, isVeg: false },
    { name: 'Butter Chicken', description: 'Tandoori chicken pieces simmered in a velvety tomato-butter gravy', price: 360, categoryId: tandoor.id, isVeg: false },
    { name: 'Reshmi Kebab', description: 'Silky smooth chicken mince kebabs with cream cheese and mild spices', price: 320, categoryId: tandoor.id, isVeg: false },
    { name: 'Paneer Malai Kebab', description: 'Cottage cheese cubes with cream, cashew paste, and mild aromatic spices', price: 300, categoryId: tandoor.id, isVeg: true },
    { name: 'Tandoori Pomfret', description: 'Whole pomfret marinated in tandoori masala, grilled over charcoal', price: 550, categoryId: tandoor.id, isVeg: false },
    { name: 'Mutton Rogan Josh', description: 'Kashmiri-style slow-cooked mutton in a rich, aromatic red gravy', price: 400, categoryId: curry.id, isVeg: false },
    { name: 'Chicken Korma', description: 'Tender chicken in a creamy cashew and poppy seed sauce', price: 340, categoryId: curry.id, isVeg: false },
    { name: 'Paneer Butter Masala', description: 'Soft paneer cubes in a rich, creamy tomato and butter sauce', price: 300, categoryId: curry.id, isVeg: true },
    { name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream', price: 260, categoryId: curry.id, isVeg: true },
    { name: 'Chettinad Chicken', description: 'Spicy and aromatic chicken curry from the Chettinad region', price: 350, categoryId: curry.id, isVeg: false },
    { name: 'Baingan Bharta', description: 'Smoky roasted eggplant mashed and cooked with onions, tomatoes, and spices', price: 220, categoryId: curry.id, isVeg: true },
    { name: 'Butter Naan', description: 'Soft leavened bread brushed with butter, baked in tandoor', price: 60, categoryId: bread.id, isVeg: true },
    { name: 'Garlic Naan', description: 'Naan studded with fresh garlic and cilantro', price: 70, categoryId: bread.id, isVeg: true },
    { name: 'Roomali Roti', description: 'Paper-thin handkerchief bread folded and served hot', price: 50, categoryId: bread.id, isVeg: true },
    { name: 'Lachha Paratha', description: 'Flaky multi-layered whole wheat bread with ghee', price: 60, categoryId: bread.id, isVeg: true },
    { name: 'Keema Naan', description: 'Naan stuffed with spiced minced mutton', price: 90, categoryId: bread.id, isVeg: false },
    { name: 'Missi Roti', description: 'Gram flour flatbread with ajwain seeds and spices', price: 55, categoryId: bread.id, isVeg: true },
    { name: 'Jeera Rice', description: 'Basmati rice tempered with cumin seeds and ghee', price: 160, categoryId: rice.id, isVeg: true },
    { name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin, garlic, and ghee', price: 180, categoryId: rice.id, isVeg: true },
    { name: 'Dal Fry', description: 'Mixed lentils cooked with tomatoes, onions, and spices', price: 180, categoryId: rice.id, isVeg: true },
    { name: 'Steam Rice', description: 'Plain steamed basmati rice', price: 120, categoryId: rice.id, isVeg: true },
    { name: 'Double Ka Meetha', description: 'Hyderabadi bread pudding soaked in saffron milk, garnished with pistachios', price: 160, categoryId: dessert.id, isVeg: true },
    { name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup', price: 120, categoryId: dessert.id, isVeg: true },
    { name: 'Kulfi Falooda', description: 'Traditional Indian ice cream with rose syrup, basil seeds, and vermicelli', price: 150, categoryId: dessert.id, isVeg: true },
    { name: 'Phirni', description: 'Creamy ground rice pudding flavoured with cardamom and saffron', price: 130, categoryId: dessert.id, isVeg: true },
    { name: 'Jalebi', description: 'Crispy spirals deep-fried and soaked in warm saffron syrup', price: 100, categoryId: dessert.id, isVeg: true },
    { name: 'Masala Chai', description: 'Strong Assam tea brewed with ginger, cardamom, and cinnamon', price: 40, categoryId: beverage.id, isVeg: true },
    { name: 'Mango Lassi', description: 'Thick and creamy Alphonso mango yoghurt shake', price: 90, categoryId: beverage.id, isVeg: true },
    { name: 'Sweet Lassi', description: 'Refreshing chilled yoghurt drink sweetened with sugar', price: 70, categoryId: beverage.id, isVeg: true },
    { name: 'Nimbu Pani', description: 'Freshly squeezed lemon water with a pinch of cumin and black salt', price: 40, categoryId: beverage.id, isVeg: true },
    { name: 'Cold Coffee', description: 'Iced coffee blended with milk, chocolate, and vanilla', price: 110, categoryId: beverage.id, isVeg: true },
    { name: 'Thandai', description: 'Chilled spiced milk with almonds, saffron, and fennel seeds', price: 100, categoryId: beverage.id, isVeg: true },
    { name: 'Fresh Lime Soda', description: 'Lime soda — sweet or salty, your choice', price: 50, categoryId: beverage.id, isVeg: true },
    { name: 'Rooh Afza', description: 'Classic rose and herb syrup blended with chilled milk', price: 60, categoryId: beverage.id, isVeg: true },
  ];

  const existingItems = await prisma.menuItem.count({ where: { restaurantId } });
  if (existingItems === 0) {
    await prisma.menuItem.createMany({
      data: items.map(item => ({ ...item, restaurantId, isAvailable: true })),
    });
  }

  for (const cat of cats) {
    const count = await prisma.menuItem.count({ where: { categoryId: cat.id } });
    await prisma.category.update({ where: { id: cat.id }, data: { itemCount: count } });
  }

  // ── Tables ──
  const existingTables = await prisma.table.count({ where: { restaurantId } });
  if (existingTables === 0) {
    const tableSeed = [
      { number: 1, seats: 2 }, { number: 2, seats: 2 }, { number: 3, seats: 4 },
      { number: 4, seats: 4 }, { number: 5, seats: 4 }, { number: 6, seats: 6 },
      { number: 7, seats: 6 }, { number: 8, seats: 2 }, { number: 9, seats: 4 },
      { number: 10, seats: 8 }, { number: 11, seats: 2 }, { number: 12, seats: 4 },
      { number: 13, seats: 6 }, { number: 14, seats: 2 }, { number: 15, seats: 10 },
    ];
    for (const t of tableSeed) {
      await prisma.table.create({ data: { ...t, status: 'available', restaurantId } });
    }
  }
}

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

  await seedRestaurantContent(restaurant.id);
  return restaurant;
}

// Self-healing: if the primary restaurant exists but has NO categories,
// NO menu items AND NO tables (a wiped/broken state), restore demo content.
// Restaurants with any existing content are left untouched — intentional
// deletions by the owner are never undone.
async function healEmptyRestaurant() {
  const restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) return;
  const [cats, items, tables] = await Promise.all([
    prisma.category.count({ where: { restaurantId: restaurant.id } }),
    prisma.menuItem.count({ where: { restaurantId: restaurant.id } }),
    prisma.table.count({ where: { restaurantId: restaurant.id } }),
  ]);
  if (cats === 0 && items === 0 && tables === 0) {
    console.log('[SEED] Restaurant exists but has no menu/tables — restoring demo content');
    await seedRestaurantContent(restaurant.id);
  }
}

// ── One-time rotation of publicly-leaked default credentials ────
async function rotateSeededCredentials() {
  const seededEmails = ['owner@hotelsiraj.in', 'chef@hotelsiraj.in', 'waiter@hotelsiraj.in', 'waiter2@hotelsiraj.in'];
  for (const email of seededEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) continue;
    const stillDefault = await bcrypt.compare('password123', user.password).catch(() => false);
    if (!stillDefault) continue;
    const newPw = crypto.randomBytes(18).toString('base64url');
    await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(newPw, 10) } });
    if (email === 'owner@hotelsiraj.in') {
      console.log(`\n[SECURITY] Default password rotated for ${email}`);
      console.log(`[SECURITY] New owner password (shown once, save it now): ${newPw}\n`);
    } else {
      console.log(`[SECURITY] Rotated default password for ${email}. Have the owner re-invite this staff member.`);
    }
  }
  const demoCustomer = await prisma.customer.findUnique({ where: { email: 'arjun@customer.com' } });
  if (demoCustomer) {
    const stillDefault = await bcrypt.compare('password123', demoCustomer.password).catch(() => false);
    if (stillDefault) {
      await prisma.customer.update({
        where: { id: demoCustomer.id },
        data: { password: await bcrypt.hash(crypto.randomBytes(18).toString('base64url'), 10) },
      });
      console.log('[SECURITY] Rotated default password for demo customer arjun@customer.com');
    }
  }
}

// ── Slug helpers ────────────────────────────────────────────────
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'restaurant';
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (await prisma.restaurant.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// Fallback for guest flows that don't carry a restaurant context
async function ensureRestaurant() {
  const r = await prisma.restaurant.findFirst();
  if (r) return r;
  return seedDefaultData();
}

// ════════════════════════════════════════════════════════════════
//  AUTH ROUTES (public)
// ════════════════════════════════════════════════════════════════

app.post('/api/auth/register', limit(authLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    password: z.string().min(8).max(128),
    restaurantName: z.string().min(2).max(80),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }
  const slug = await uniqueSlug(slugify(parsed.data.restaurantName));
  const restaurant = await prisma.restaurant.create({
    data: { name: parsed.data.restaurantName, slug, description: 'New restaurant' },
  });
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: pw, role: 'owner', restaurantId: restaurant.id },
  });
  const token = signStaffToken(user);
  return res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId },
      restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
      token,
      refreshToken: signRefreshToken({ sub: user.id, role: user.role, restaurantId: user.restaurantId, type: 'staff' }),
    },
  });
}));

app.post('/api/auth/login', limit(authLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({ email: z.string().email().max(120), password: z.string().min(8).max(128) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await bcrypt.compare(parsed.data.password, user.password);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const restaurant = user.restaurantId ? await prisma.restaurant.findUnique({ where: { id: user.restaurantId } }) : null;
  const token = signStaffToken(user);
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId },
      restaurant: restaurant ? { id: restaurant.id, name: restaurant.name, slug: restaurant.slug } : null,
      token,
      refreshToken: signRefreshToken({ sub: user.id, role: user.role, restaurantId: user.restaurantId, type: 'staff' }),
    },
  });
}));

// ════════════════════════════════════════════════════════════════
//  CUSTOMER AUTH (public)
// ════════════════════════════════════════════════════════════════

async function createCustomerAccount(body: any) {
  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    phone: z.string().max(20).optional(),
    password: z.string().min(6).max(128),
    restaurantId: z.string().max(64).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { error: 'Validation failed', errors: parsed.error.flatten() } as const;
  const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: 'Account already exists', status: 409 } as const;
  let restaurantId = parsed.data.restaurantId || null;
  if (restaurantId) {
    const r = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!r) restaurantId = null;
  }
  if (!restaurantId) {
    restaurantId = (await ensureRestaurant()).id;
  }
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const customer = await prisma.customer.create({
    data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, password: pw, restaurantId },
  });
  return {
    created: {
      user: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, role: 'customer' },
      token: signCustomerToken(customer),
    },
  } as const;
}

app.post('/api/customer/register', limit(authLimiter), asyncHandler(async (req, res) => {
  const result = await createCustomerAccount(req.body);
  if ('error' in result) {
    return res.status(result.status || 400).json({ success: false, message: result.error, errors: result.errors });
  }
  return res.status(201).json({ success: true, data: result.created });
}));

app.post('/api/customer/login', limit(authLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({ email: z.string().email().max(120), password: z.string().min(6).max(128) });
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
    data: {
      user: {
        id: customer.id, name: customer.name, email: customer.email, phone: customer.phone,
        role: 'customer', points: customer.points, totalSpent: customer.totalSpent, visitCount: customer.visitCount,
      },
      token: signCustomerToken(customer),
    },
  });
}));

// Legacy alias used by older frontend builds
app.post('/api/auth/register-customer', limit(authLimiter), asyncHandler(async (req, res) => {
  const result = await createCustomerAccount(req.body);
  if ('error' in result) {
    return res.status(result.status || 400).json({ success: false, message: result.error, errors: result.errors });
  }
  return res.status(201).json({ success: true, data: result.created });
}));

app.get('/api/customer/me', requireAuth('customer'), asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.auth!.sub },
    include: {
      orders: { include: { items: true }, orderBy: { createdAt: 'desc' } },
      reservations: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  return res.json({
    success: true,
    data: {
      id: customer.id, name: customer.name, email: customer.email, phone: customer.phone,
      points: customer.points, totalSpent: customer.totalSpent, visitCount: customer.visitCount,
      orders: customer.orders, reservations: customer.reservations,
    },
  });
}));

// ════════════════════════════════════════════════════════════════
//  PROFILE & STAFF MANAGEMENT (staff-only)
// ════════════════════════════════════════════════════════════════

app.get('/api/auth/profile', requireAuth('staff'), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const restaurant = user.restaurantId ? await prisma.restaurant.findUnique({ where: { id: user.restaurantId } }) : null;
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, restaurantId: user.restaurantId },
      restaurant,
    },
  });
}));

app.put('/api/auth/profile', requireAuth('staff'), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.sub } });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: typeof req.body.name === 'string' && req.body.name.trim() ? req.body.name.slice(0, 80) : user.name },
    select: { id: true, name: true, email: true, role: true },
  });
  return res.json({ success: true, data: updated });
}));

app.post('/api/auth/register-staff', requireAuth('staff'), requireRole('owner'), limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    password: z.string().min(8).max(128),
    role: z.enum(['waiter', 'chef']).default('waiter'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists' });
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const staffMember = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: pw, role: parsed.data.role, restaurantId: rid },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  emitToRestaurant(rid, 'waiter:new', staffMember);
  return res.status(201).json({ success: true, data: staffMember });
}));

const staffSelect = { id: true, name: true, email: true, role: true, createdAt: true };

app.get('/api/auth/staff', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const staffMembers = await prisma.user.findMany({
    where: { restaurantId: rid, role: { in: ['waiter', 'chef'] } },
    select: staffSelect,
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: staffMembers });
}));

app.delete('/api/auth/staff/:id', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const id = paramStr(req.params.id);
  if (id === req.auth!.sub) return res.status(400).json({ success: false, message: 'Cannot remove your own account' });
  const user = await prisma.user.findFirst({ where: { id, restaurantId: rid } });
  if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' });
  if (user.role === 'owner') return res.status(400).json({ success: false, message: 'Cannot remove the owner' });
  await prisma.order.updateMany({ where: { claimedById: id }, data: { claimedById: null } });
  await prisma.user.delete({ where: { id } });
  return res.json({ success: true, data: { id } });
}));

// Legacy aliases kept in sync with /api/auth/staff*
app.get('/api/waiters', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const staffMembers = await prisma.user.findMany({
    where: { restaurantId: rid, role: { in: ['waiter', 'chef'] } },
    select: staffSelect,
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: staffMembers });
}));

app.post('/api/waiters', requireAuth('staff'), requireRole('owner'), limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    password: z.string().min(8).max(128),
    role: z.enum(['waiter', 'chef']).default('waiter'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Password of at least 8 characters is required' });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists' });
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const pw = await bcrypt.hash(parsed.data.password, 10);
  const staffMember = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: pw, role: parsed.data.role, restaurantId: rid },
    select: staffSelect,
  });
  emitToRestaurant(rid, 'waiter:new', staffMember);
  return res.status(201).json({ success: true, data: staffMember });
}));

app.delete('/api/waiters/:id', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const id = paramStr(req.params.id);
  if (id === req.auth!.sub) return res.status(400).json({ success: false, message: 'Cannot remove your own account' });
  const user = await prisma.user.findFirst({ where: { id, restaurantId: rid } });
  if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' });
  if (user.role === 'owner') return res.status(400).json({ success: false, message: 'Cannot remove the owner' });
  await prisma.order.updateMany({ where: { claimedById: id }, data: { claimedById: null } });
  await prisma.user.delete({ where: { id } });
  return res.json({ success: true, data: { id } });
}));

// ════════════════════════════════════════════════════════════════
//  RESTAURANT SETTINGS & ONBOARDING (owner-only)
// ════════════════════════════════════════════════════════════════

app.get('/api/restaurant', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const restaurant = await prisma.restaurant.findUnique({ where: { id: rid } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  res.json({ success: true, data: restaurant });
}));

app.get('/api/onboarding/status', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const restaurant = await prisma.restaurant.findUnique({ where: { id: rid } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const settings = parseJsonValue(restaurant.settings);
  return res.json({ success: true, data: { restaurant, onboarding: settings.onboarding || {} } });
}));

async function mergeOnboardingSettings(rid: string, key: string, value: unknown) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: rid } });
  if (!restaurant) return null;
  const settings = parseJsonValue(restaurant.settings) as Record<string, any>;
  settings.onboarding = { ...(settings.onboarding || {}), [key]: value };
  return prisma.restaurant.update({ where: { id: rid }, data: { settings: JSON.stringify(settings) } });
}

app.post('/api/onboarding/restaurant', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const restaurant = await prisma.restaurant.findUnique({ where: { id: rid } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const str = (v: unknown, fb: string | null) => (typeof v === 'string' && v.trim() ? v.slice(0, 300) : (fb ?? undefined));
  const updated = await prisma.restaurant.update({
    where: { id: rid },
    data: {
      name: str(req.body.name, restaurant.name),
      description: str(req.body.description, restaurant.description),
      phone: str(req.body.phone, restaurant.phone),
      email: str(req.body.email, restaurant.email),
      address: str(req.body.address, restaurant.address),
    },
  });
  await mergeOnboardingSettings(rid, 'restaurant', req.body);
  return res.json({ success: true, data: updated });
}));

app.post('/api/onboarding/branch', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const updated = await mergeOnboardingSettings(rid, 'branch', req.body);
  return res.json({ success: true, data: updated });
}));

app.post('/api/onboarding/tables', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const tables = Array.isArray(req.body.tables) ? req.body.tables.slice(0, 200) : [];
  const existingTables = await prisma.table.findMany({ where: { restaurantId: rid }, select: { number: true } });
  const existingNumbers = new Set(existingTables.map(t => t.number));
  const tablesToCreate = tables
    .map((t: any) => ({ number: Number(t.number), seats: Number(t.seats) }))
    .filter((t: any) => Number.isInteger(t.number) && t.number > 0 && Number.isInteger(t.seats) && t.seats > 0)
    .filter((t: any) => !existingNumbers.has(t.number));
  const skippedCount = tables.length - tablesToCreate.length;
  const created = [];
  for (const t of tablesToCreate) {
    created.push(await prisma.table.create({
      data: { restaurantId: rid, number: t.number, seats: t.seats, status: 'available' },
    }));
  }
  return res.json({ success: true, data: { created, skipped: skippedCount } });
}));

app.post('/api/onboarding/menu', requireAuth('staff'), requireRole('owner'), asyncHandler(async (_req, res) => {
  return res.json({ success: true, data: { message: 'Use the menu management endpoints to add categories and items' } });
}));

app.post('/api/onboarding/payments', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const updated = await mergeOnboardingSettings(rid, 'payments', req.body);
  return res.json({ success: true, data: updated });
}));

app.post('/api/onboarding/complete', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const updated = await mergeOnboardingSettings(rid, 'completed', { value: true, completedAt: new Date().toISOString() });
  return res.json({ success: true, data: updated });
}));

// ════════════════════════════════════════════════════════════════
//  CATEGORIES (staff-only, tenant-scoped)
// ════════════════════════════════════════════════════════════════

app.get('/api/categories', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const categories = await prisma.category.findMany({ where: { restaurantId: rid }, orderBy: { order: 'asc' } });
  res.json({ success: true, data: categories });
}));

app.post('/api/categories', requireAuth('staff'), limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(1).max(60), slug: z.string().max(60).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  try {
    const newCat = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug || parsed.data.name.toLowerCase().replace(/\s+/g, '-'),
        itemCount: 0,
        order: (await prisma.category.count({ where: { restaurantId: rid } })) + 1,
        restaurantId: rid,
      },
    });
    return res.status(201).json({ success: true, data: newCat });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A category with this name already exists' });
    }
    throw err;
  }
}));

app.put('/api/categories/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const cat = await prisma.category.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  const updated = await prisma.category.update({
    where: { id: cat.id },
    data: {
      name: typeof req.body.name === 'string' && req.body.name.trim() ? req.body.name.slice(0, 60) : cat.name,
      slug: typeof req.body.slug === 'string' && req.body.slug.trim() ? req.body.slug.slice(0, 60) : cat.slug,
    },
  });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/categories/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const cat = await prisma.category.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  await prisma.category.delete({ where: { id: cat.id } });
  return res.json({ success: true, data: { id: cat.id } });
}));

// ════════════════════════════════════════════════════════════════
//  MENU ITEMS (staff-only, tenant-scoped, whitelisted updates)
// ════════════════════════════════════════════════════════════════

app.get('/api/menu-items', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const items = await prisma.menuItem.findMany({ where: { restaurantId: rid }, orderBy: { createdAt: 'asc' } });
  res.json({ success: true, data: items });
}));

app.post('/api/menu-items', requireAuth('staff'), limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).max(120),
    description: z.string().min(1).max(500),
    price: z.number().min(0).max(1000000),
    categoryId: z.string().min(1).max(64),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const category = await prisma.category.findFirst({ where: { id: parsed.data.categoryId, restaurantId: rid } });
  if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });
  const item = await prisma.menuItem.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      categoryId: category.id,
      restaurantId: rid,
      isVeg: parsed.data.isVeg ?? true,
      isAvailable: parsed.data.isAvailable ?? true,
    },
  });
  return res.status(201).json({ success: true, data: item });
}));

app.put('/api/menu-items/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const item = await prisma.menuItem.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  const b = req.body;
  if (b.categoryId !== undefined) {
    const category = await prisma.category.findFirst({ where: { id: String(b.categoryId), restaurantId: rid } });
    if (!category) return res.status(400).json({ success: false, message: 'Invalid category' });
  }
  const updated = await prisma.menuItem.update({
    where: { id: item.id },
    data: {
      name: typeof b.name === 'string' && b.name.trim() ? b.name.slice(0, 120) : item.name,
      description: typeof b.description === 'string' && b.description.trim() ? b.description.slice(0, 500) : item.description,
      price: typeof b.price === 'number' && b.price >= 0 ? b.price : item.price,
      isVeg: typeof b.isVeg === 'boolean' ? b.isVeg : item.isVeg,
      isAvailable: typeof b.isAvailable === 'boolean' ? b.isAvailable : item.isAvailable,
      categoryId: b.categoryId !== undefined ? String(b.categoryId) : item.categoryId,
    },
  });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/menu-items/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const item = await prisma.menuItem.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  await prisma.menuItem.delete({ where: { id: item.id } });
  return res.json({ success: true, data: { id: item.id } });
}));

app.get('/api/menu-items/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const item = await prisma.menuItem.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
  res.json({ success: true, data: item });
}));

// Count endpoints (staff-only, scoped)
app.get('/api/categories/count', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const count = await prisma.category.count({ where: { restaurantId: rid } });
  res.json({ success: true, data: count });
}));

app.get('/api/menu-items/count', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const count = await prisma.menuItem.count({ where: { restaurantId: rid } });
  res.json({ success: true, data: count });
}));

app.get('/api/tables/count', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const count = await prisma.table.count({ where: { restaurantId: rid } });
  res.json({ success: true, data: count });
}));

// ════════════════════════════════════════════════════════════════
//  TABLES (staff-only, tenant-scoped)
// ════════════════════════════════════════════════════════════════

const TABLE_STATUSES = ['available', 'occupied', 'reserved', 'cleaning'];

app.get('/api/tables', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const tables = await prisma.table.findMany({ where: { restaurantId: rid }, orderBy: { number: 'asc' } });
  res.json({ success: true, data: tables });
}));

app.post('/api/tables', requireAuth('staff'), limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({ number: z.number().int().positive(), seats: z.number().int().positive().max(50) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  try {
    const table = await prisma.table.create({
      data: { number: parsed.data.number, seats: parsed.data.seats, status: 'available', restaurantId: rid },
    });
    return res.status(201).json({ success: true, data: table });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ success: false, message: `Table #${parsed.data.number} already exists. Pick a different number.` });
    }
    throw err;
  }
}));

app.put('/api/tables/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const table = await prisma.table.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
  const b = req.body;
  const updated = await prisma.table.update({
    where: { id: table.id },
    data: {
      seats: typeof b.seats === 'number' && b.seats > 0 ? b.seats : table.seats,
      status: typeof b.status === 'string' && TABLE_STATUSES.includes(b.status) ? b.status : table.status,
    },
  });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/tables/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const table = await prisma.table.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
  await prisma.table.delete({ where: { id: table.id } });
  return res.json({ success: true, data: { id: table.id } });
}));

app.post('/api/tables/bulk', requireAuth('staff'), limit(writeLimiter), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const tables = Array.isArray(req.body.tables) ? req.body.tables.slice(0, 200) : [];
  const existingTables = await prisma.table.findMany({ where: { restaurantId: rid }, select: { number: true } });
  const existingNumbers = new Set(existingTables.map(t => t.number));
  const tablesToCreate = tables
    .map((t: any) => ({ number: Number(t.number), seats: Number(t.seats) }))
    .filter((t: any) => Number.isInteger(t.number) && t.number > 0 && Number.isInteger(t.seats) && t.seats > 0 && t.seats <= 50)
    .filter((t: any) => !existingNumbers.has(t.number));
  const created = [];
  for (const t of tablesToCreate) {
    created.push(await prisma.table.create({
      data: { restaurantId: rid, number: t.number, seats: t.seats, status: 'available' },
    }));
  }
  return res.json({ success: true, data: created });
}));

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════

// Staff: list orders for own restaurant
app.get('/api/orders', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const orders = await prisma.order.findMany({
    where: { restaurantId: rid },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: orders });
}));

app.get('/api/orders/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const order = await prisma.order.findFirst({
    where: { id: paramStr(req.params.id), restaurantId: rid },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  return res.json({ success: true, data: order });
}));

// Public: guests place orders. Prices are ALWAYS computed server-side from the menu.
app.post('/api/orders', limit(writeLimiter), asyncHandler(async (req, res) => {
  let restaurant = null;
  if (typeof req.body.restaurantId === 'string' && req.body.restaurantId.length <= 64) {
    restaurant = await prisma.restaurant.findUnique({ where: { id: req.body.restaurantId } });
  }
  if (!restaurant) {
    restaurant = await ensureRestaurant();
  }

  const tableNumber = Number(req.body.tableNumber);
  const customerName = typeof req.body.customerName === 'string' && req.body.customerName.trim()
    ? req.body.customerName.trim().slice(0, 80) : 'Guest';
  const itemsInput = Array.isArray(req.body.items) ? req.body.items.slice(0, 50) : [];

  if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 100000) {
    return res.status(400).json({ success: false, message: 'Valid table number is required' });
  }
  if (itemsInput.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one item is required' });
  }

  const resolvedItems: { menuItemId: string | null; quantity: number; price: number; name: string }[] = [];
  for (const entry of itemsInput) {
    const quantity = Number(entry?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return res.status(400).json({ success: false, message: 'Invalid item quantity' });
    }
    const menuItem = typeof entry?.itemId === 'string'
      ? await prisma.menuItem.findFirst({ where: { id: entry.itemId, restaurantId: restaurant.id } })
      : null;
    if (!menuItem) {
      return res.status(400).json({ success: false, message: 'One or more items are not on this restaurant\'s menu' });
    }
    resolvedItems.push({ menuItemId: menuItem.id, quantity, price: menuItem.price, name: menuItem.name });
  }

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const customerId = typeof req.body.customerId === 'string' && req.body.customerId.length <= 64 ? req.body.customerId : null;

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
      customerId,
      items: {
        create: resolvedItems.map(i => ({
          itemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });

  emitToRestaurant(restaurant.id, 'order:new', order);
  return res.status(201).json({ success: true, data: order });
}));

// Staff: advance order status through the allowed state machine
app.put('/api/orders/:id/status', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const order = await prisma.order.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

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
  const nextStatus = typeof req.body.status === 'string' ? req.body.status : '';
  if (!transitionMap[order.status]?.includes(nextStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid status transition' });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      paymentStatus: ['PAID', 'COMPLETED'].includes(nextStatus) ? 'PAID' : order.paymentStatus,
    },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });
  emitToRestaurant(rid, 'order:update', updated);
  return res.json({ success: true, data: updated });
}));

// Staff: claim / release
app.put('/api/orders/:id/claim', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const order = await prisma.order.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.claimedById && order.claimedById !== req.auth!.sub) {
    return res.status(409).json({ success: false, message: 'Order already claimed by another staff member' });
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { claimedById: req.auth!.sub, status: order.status === 'PENDING' ? 'ACCEPTED' : order.status },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });
  emitToRestaurant(rid, 'order:update', updated);
  return res.json({ success: true, data: updated });
}));

app.put('/api/orders/:id/release', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const order = await prisma.order.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { claimedById: null, status: order.status === 'ACCEPTED' ? 'PENDING' : order.status },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });
  emitToRestaurant(rid, 'order:update', updated);
  return res.json({ success: true, data: updated });
}));

// ════════════════════════════════════════════════════════════════
//  STATS (staff-only, scoped)
// ════════════════════════════════════════════════════════════════

app.get('/api/stats/waiters', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const waiters = await prisma.user.findMany({ where: { restaurantId: rid, role: 'waiter' }, select: { id: true, name: true, email: true } });
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

app.get('/api/auth/dashboard-stats', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const totalOrders = await prisma.order.count({ where: { restaurantId: rid } });
  const totalRevenue = await prisma.order.aggregate({ where: { restaurantId: rid, paymentStatus: 'PAID' }, _sum: { total: true } });
  const totalCustomers = await prisma.customer.count({ where: { restaurantId: rid } });
  const totalMenuItems = await prisma.menuItem.count({ where: { restaurantId: rid } });
  const activeTables = await prisma.table.count({ where: { restaurantId: rid, status: 'available' } });
  const pendingOrders = await prisma.order.count({ where: { restaurantId: rid, status: 'PENDING' } });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = await prisma.order.count({ where: { restaurantId: rid, createdAt: { gte: today } } });
  const todayRevenue = await prisma.order.aggregate({ where: { restaurantId: rid, paymentStatus: 'PAID', createdAt: { gte: today } }, _sum: { total: true } });
  return res.json({
    success: true,
    data: {
      totalOrders, totalRevenue: totalRevenue._sum.total || 0, totalCustomers, totalMenuItems,
      activeTables, pendingOrders, todayOrders, todayRevenue: todayRevenue._sum.total || 0,
    },
  });
}));

// ════════════════════════════════════════════════════════════════
//  CUSTOMERS LIST (owner-only, never exposes password hashes)
// ════════════════════════════════════════════════════════════════

app.get('/api/auth/customers', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const customers = await prisma.customer.findMany({
    where: { restaurantId: rid },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, phone: true, points: true, totalSpent: true, visitCount: true, createdAt: true },
  });
  res.json({ success: true, data: customers });
}));

// ════════════════════════════════════════════════════════════════
//  RESERVATIONS
// ════════════════════════════════════════════════════════════════

const RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'];

app.get('/api/reservations', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const reservations = await prisma.reservation.findMany({ where: { restaurantId: rid }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: reservations });
}));

app.post('/api/reservations', limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({
    customerName: z.string().min(1).max(80),
    phone: z.string().max(20).optional(),
    email: z.string().email().max(120).optional(),
    partySize: z.number().int().positive().max(100),
    date: z.string().min(4).max(40),
    time: z.string().min(2).max(20),
    notes: z.string().max(500).optional(),
    customerId: z.string().max(64).optional(),
    restaurantId: z.string().max(64).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Missing or invalid reservation details' });
  }
  let restaurantId = parsed.data.restaurantId || null;
  if (restaurantId) {
    const r = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!r) restaurantId = null;
  }
  if (!restaurantId) restaurantId = (await ensureRestaurant()).id;

  const reservation = await prisma.reservation.create({
    data: {
      restaurantId,
      customerId: parsed.data.customerId || null,
      customerName: parsed.data.customerName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      partySize: parsed.data.partySize,
      date: parsed.data.date,
      time: parsed.data.time,
      notes: parsed.data.notes || null,
      status: 'PENDING',
    },
  });
  return res.status(201).json({ success: true, data: reservation });
}));

app.put('/api/reservations/:id/status', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const reservation = await prisma.reservation.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
  const status = typeof req.body.status === 'string' ? req.body.status : '';
  if (!RESERVATION_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  const updated = await prisma.reservation.update({ where: { id: reservation.id }, data: { status } });
  return res.json({ success: true, data: updated });
}));

app.put('/api/reservations/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const reservation = await prisma.reservation.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
  const b = req.body;
  const updated = await prisma.reservation.update({
    where: { id: reservation.id },
    data: {
      status: typeof b.status === 'string' && RESERVATION_STATUSES.includes(b.status) ? b.status : reservation.status,
      customerName: typeof b.customerName === 'string' && b.customerName.trim() ? b.customerName.slice(0, 80) : reservation.customerName,
      partySize: typeof b.partySize === 'number' && b.partySize > 0 ? Math.min(b.partySize, 100) : reservation.partySize,
      date: typeof b.date === 'string' && b.date ? b.date.slice(0, 40) : reservation.date,
      time: typeof b.time === 'string' && b.time ? b.time.slice(0, 20) : reservation.time,
      notes: typeof b.notes === 'string' ? b.notes.slice(0, 500) : reservation.notes,
    },
  });
  return res.json({ success: true, data: updated });
}));

app.delete('/api/reservations/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const reservation = await prisma.reservation.findFirst({ where: { id: paramStr(req.params.id), restaurantId: rid } });
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
  await prisma.reservation.delete({ where: { id: reservation.id } });
  return res.json({ success: true, data: { id: reservation.id } });
}));

// ════════════════════════════════════════════════════════════════
//  RESTAURANTS (scoped access)
// ════════════════════════════════════════════════════════════════

app.get('/api/restaurants', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const restaurant = await prisma.restaurant.findUnique({ where: { id: rid } });
  res.json({ success: true, data: restaurant ? [restaurant] : [] });
}));

// Public: minimal info by slug (used before login)
app.get('/api/restaurants/slug/:slug', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: paramStr(req.params.slug) },
    select: publicRestaurantFields,
  });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  res.json({ success: true, data: restaurant });
}));

app.get('/api/restaurants/:id', requireAuth('staff'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  if (paramStr(req.params.id) !== rid) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const restaurant = await prisma.restaurant.findUnique({ where: { id: rid } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  res.json({ success: true, data: restaurant });
}));

app.put('/api/restaurants/:id', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  if (paramStr(req.params.id) !== rid) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const restaurant = await prisma.restaurant.findUnique({ where: { id: rid } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const str = (v: unknown, fb: string | null) => (typeof v === 'string' && v.trim() ? v.slice(0, 300) : (fb ?? undefined));
  const settings = parseJsonValue(restaurant.settings) as Record<string, any>;
  let settingsChanged = false;
  if (req.body.upiVpa !== undefined || req.body.upiPayeeName !== undefined) {
    const vpa = typeof req.body.upiVpa === 'string' && /^[\w.\-]{2,64}@[a-zA-Z]{2,32}$/.test(req.body.upiVpa.trim())
      ? req.body.upiVpa.trim() : null;
    if (req.body.upiVpa !== undefined && !vpa) {
      return res.status(400).json({ success: false, message: 'Invalid UPI ID format' });
    }
    settings.upi = {
      ...(settings.upi || {}),
      vpa: vpa ?? (settings.upi?.vpa ?? null),
      payeeName: typeof req.body.upiPayeeName === 'string' && req.body.upiPayeeName.trim()
        ? req.body.upiPayeeName.trim().slice(0, 50)
        : (settings.upi?.payeeName ?? restaurant.name),
    };
    settingsChanged = true;
  }
  const updated = await prisma.restaurant.update({
    where: { id: rid },
    data: {
      name: str(req.body.name, restaurant.name),
      description: str(req.body.description, restaurant.description),
      phone: str(req.body.phone, restaurant.phone),
      email: str(req.body.email, restaurant.email),
      address: str(req.body.address, restaurant.address),
      ...(settingsChanged ? { settings: JSON.stringify(settings) } : {}),
    },
  });
  res.json({ success: true, data: updated });
}));

// ════════════════════════════════════════════════════════════════
//  PAYMENTS
// ════════════════════════════════════════════════════════════════

// Staff records an offline/counter payment — amount comes from the order, never the client
app.post('/api/payments/create', requireAuth('staff'), limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({
    orderId: z.string().min(1).max(64),
    method: z.enum(['online', 'counter', 'card', 'cash', 'mobile']),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed' });
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const order = await prisma.order.findFirst({ where: { id: parsed.data.orderId, restaurantId: rid } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentStatus === 'PAID') return res.status(409).json({ success: false, message: 'Order is already paid' });
  const payment = await prisma.payment.create({
    data: { orderId: order.id, amount: order.total, method: parsed.data.method, status: 'PAID' },
  });
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'PAID', status: order.status === 'COMPLETED' ? 'COMPLETED' : 'PAID' },
  });
  emitToRestaurant(rid, 'payment:update', { ...payment, order: updatedOrder });
  return res.json({ success: true, data: payment });
}));

app.get('/api/payments', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const rid = requireStaffRestaurant(req, res);
  if (!rid) return;
  const payments = await prisma.payment.findMany({
    where: { order: { restaurantId: rid } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: payments });
}));

// Public: initiate a Razorpay order for guest checkout.
// The Razorpay order id is persisted so verify-time replay across orders is impossible.
app.post('/api/payments/create-order', limit(writeLimiter), asyncHandler(async (req, res) => {
  const orderId = typeof req.body.orderId === 'string' ? req.body.orderId.slice(0, 64) : '';
  if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentStatus === 'PAID') return res.status(409).json({ success: false, message: 'Order is already paid' });
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: 'Payment provider is not configured' });
  }
  try {
    // Idempotent: reuse the existing Razorpay order if one was already created
    if (order.razorpayOrderId) {
      const existing = await razorpay.orders.fetch(order.razorpayOrderId);
      return res.json({
        success: true,
        data: {
          razorpayOrderId: existing.id, orderId: existing.id,
          keyId: process.env.RAZORPAY_KEY_ID, amount: existing.amount, currency: existing.currency,
        },
      });
    }
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: orderId,
    });
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: razorpayOrder.id } });
    return res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id, orderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID, amount: razorpayOrder.amount, currency: razorpayOrder.currency,
      },
    });
  } catch (rpErr: any) {
    console.error('[Razorpay] create-order failed:', rpErr?.error?.description || rpErr?.message || rpErr);
    return res.status(502).json({ success: false, message: 'Payment provider error. Please try again.' });
  }
}));

// Public: verify a Razorpay payment. Signature + linkage + amount + gateway status are ALL checked.
app.post('/api/payments/verify', limit(writeLimiter), asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (
    typeof orderId !== 'string' || !orderId ||
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_signature !== 'string'
  ) {
    return res.status(400).json({ success: false, message: 'Missing payment verification details' });
  }
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: 'Payment provider is not configured' });
  }
  const order = await prisma.order.findUnique({ where: { id: orderId.slice(0, 64) } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentStatus === 'PAID') {
    return res.json({ success: true, data: { verified: true } });
  }
  // 1) The Razorpay order must be the one WE created for THIS internal order
  if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({ success: false, message: 'Payment does not match this order' });
  }
  // 2) HMAC signature check (tamper-proofing)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
  }
  // 3) Confirm with Razorpay itself: payment exists, belongs to the order, right amount, actually paid
  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Payment does not match this order' });
    }
    if (Number(payment.amount) !== Math.round(order.total * 100)) {
      return res.status(400).json({ success: false, message: 'Payment amount mismatch' });
    }
    if (!['captured', 'authorized'].includes(payment.status)) {
      return res.status(400).json({ success: false, message: 'Payment was not completed' });
    }
  } catch (rpErr: any) {
    console.error('[Razorpay] verify fetch failed:', rpErr?.error?.description || rpErr?.message || rpErr);
    return res.status(502).json({ success: false, message: 'Could not confirm payment with provider' });
  }
  await prisma.payment.create({ data: { orderId: order.id, amount: order.total, method: 'online', status: 'PAID' } });
  await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID', status: 'COMPLETED' } });
  emitToRestaurant(order.restaurantId, 'payment:update', { orderId: order.id, status: 'PAID' });
  return res.json({ success: true, data: { verified: true } });
}));

// ════════════════════════════════════════════════════════════════
//  DIRECT UPI (BHIM) — gateway-free payments with notification relay
// ════════════════════════════════════════════════════════════════

const UPI_SHORT_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no I,L,O,0,1
const UPI_INTENT_TTL_MS = 30 * 60 * 1000;      // intent reuse window
const UPI_MATCH_WINDOW_MS = 20 * 60 * 1000;    // webhook matching window

function upiPaise(orderId: string): number {
  return crypto.createHash('sha1').update(orderId).digest()[0] % 100;
}

function randomShortCode(): string {
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) code += UPI_SHORT_ALPHABET[bytes[i] % UPI_SHORT_ALPHABET.length];
  return code;
}

async function upiSettingsFor(restaurantId: string): Promise<{ vpa: string; payeeName: string } | null> {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) return null;
  const settings = parseJsonValue(restaurant.settings) as { upi?: { vpa?: string; payeeName?: string } };
  if (!settings.upi?.vpa) return null;
  return { vpa: settings.upi.vpa, payeeName: settings.upi.payeeName || restaurant.name };
}

// Customer requests a direct-UPI intent: unique amount + short code + deep link
app.get('/api/payments/upi-intent/:orderId', limit(writeLimiter), asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: paramStr(req.params.orderId) } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentStatus === 'PAID') return res.status(409).json({ success: false, message: 'Order is already paid' });

  const upi = await upiSettingsFor(order.restaurantId);
  if (!upi) return res.status(400).json({ success: false, message: 'UPI payments are not configured for this restaurant' });

  // Idempotent within the TTL window
  if (order.expectedUpiAmount != null && order.orderShortCode && order.upiIntentAt &&
      Date.now() - new Date(order.upiIntentAt).getTime() < UPI_INTENT_TTL_MS) {
    return res.json({
      success: true,
      data: {
        vpa: upi.vpa, payeeName: upi.payeeName,
        amount: order.expectedUpiAmount, shortCode: order.orderShortCode,
        deepLink: `upi://pay?pa=${encodeURIComponent(upi.vpa)}&pn=${encodeURIComponent(upi.payeeName)}&am=${order.expectedUpiAmount.toFixed(2)}&cu=INR&tn=Servora%20${order.orderShortCode}`,
      },
    });
  }

  // Assign a unique paise fingerprint among live pending intents with the same rupee base
  const liveIntents = await prisma.order.findMany({
    where: {
      paymentStatus: { not: 'PAID' },
      status: { notIn: ['CANCELLED'] },
      expectedUpiAmount: { not: null },
      upiIntentAt: { gte: new Date(Date.now() - UPI_MATCH_WINDOW_MS) },
    },
    select: { expectedUpiAmount: true },
  });
  const takenPaises = new Set(
    liveIntents
      .map(o => Math.round((o.expectedUpiAmount! % 1) * 100))
      .filter(p => Number.isFinite(p))
  );

  const base = Math.floor(order.total);
  const startPaise = upiPaise(order.id);
  let paise = startPaise;
  while (takenPaises.has(paise)) paise = (paise + 1) % 100;
  let expected = base + paise / 100;
  if (expected < order.total - 0.005) expected = base + 1 + paise / 100; // never undercharge

  // Short code unique across all orders (DB unique index backstops races)
  let shortCode = order.orderShortCode;
  if (!shortCode) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = randomShortCode();
      const clash = await prisma.order.findFirst({ where: { orderShortCode: candidate }, select: { id: true } });
      if (!clash) { shortCode = candidate; break; }
    }
    if (!shortCode) shortCode = randomShortCode() + randomShortCode().slice(0, 2);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { expectedUpiAmount: expected, orderShortCode: shortCode, upiIntentAt: new Date() },
  });

  return res.json({
    success: true,
    data: {
      vpa: upi.vpa, payeeName: upi.payeeName,
      amount: expected, shortCode,
      deepLink: `upi://pay?pa=${encodeURIComponent(upi.vpa)}&pn=${encodeURIComponent(upi.payeeName)}&am=${expected.toFixed(2)}&cu=INR&tn=Servora%20${shortCode}`,
    },
  });
}));

// Relay webhook from the merchant's phone (MacroDroid → this endpoint).
// Match cascade: short code in note → exact unique amount → single candidate in window.
// Ambiguity NEVER auto-resolves — it escalates to staff confirmation.
const upiWebhookLimiter = new RateLimiterMemory({ points: 60, duration: 60 });

app.post('/api/payments/upi-webhook', limit(upiWebhookLimiter), asyncHandler(async (req, res) => {
  const secret = process.env.UPI_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: 'UPI webhook not configured' });
  const provided = req.headers['x-webhook-secret'];
  if (typeof provided !== 'string' ||
      provided.length !== secret.length ||
      !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(secret))) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const rawText = typeof req.body.raw === 'string' ? req.body.raw : '';
  const amountNum = Number(req.body.amount);
  const reference = typeof req.body.reference === 'string' ? req.body.reference.slice(0, 64) : null;
  console.log('[UPI Webhook]', JSON.stringify({ amount: req.body.amount, reference, app: req.body.app, raw: rawText.slice(0, 200) }));

  if (reference) {
    const seen = await prisma.payment.findFirst({ where: { reference, method: 'upi' }, select: { id: true } });
    if (seen) return res.json({ success: true, data: { matched: false, reason: 'duplicate' } });
  }

  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    return res.json({ success: true, data: { matched: false, reason: 'invalid_amount' } });
  }
  const amountPaise = Math.round(amountNum * 100);

  const candidates = await prisma.order.findMany({
    where: {
      paymentStatus: { not: 'PAID' },
      status: { notIn: ['CANCELLED', 'COMPLETED'] },
      expectedUpiAmount: { not: null },
      upiIntentAt: { gte: new Date(Date.now() - UPI_MATCH_WINDOW_MS) },
    },
    orderBy: { upiIntentAt: 'asc' },
    include: { items: true },
  });

  // Layer 1: short code present in notification text
  const codeMatch = rawText ? rawText.toUpperCase().match(/\b([A-HJ-NP-Z2-9]{6})\b/) : null;
  let matchedOrder = null;
  let needsReview = false;

  if (codeMatch) {
    const byCode = candidates.filter(o => o.orderShortCode === codeMatch[1]);
    if (byCode.length === 1) {
      const o = byCode[0];
      const expectedPaise = Math.round((o.expectedUpiAmount as number) * 100);
      if (Math.abs(expectedPaise - amountPaise) <= 100) {
        matchedOrder = o; // code agrees and amount is close → strong match
      } else {
        needsReview = true; // right code, wrong amount → human decides
      }
    }
  }

  // Layer 2: exact amount match
  if (!matchedOrder && !needsReview) {
    const byAmount = candidates.filter(o => Math.round((o.expectedUpiAmount as number) * 100) === amountPaise);
    if (byAmount.length === 1) {
      matchedOrder = byAmount[0];
    } else if (byAmount.length > 1) {
      needsReview = true; // ambiguous → never guess
    }
  }

  if (!matchedOrder) {
    return res.json({ success: true, data: { matched: false, reason: needsReview ? 'ambiguous_needs_review' : 'no_candidate' } });
  }

  await prisma.payment.create({
    data: {
      orderId: matchedOrder.id,
      amount: matchedOrder.expectedUpiAmount ?? amountPaise / 100,
      method: 'upi',
      status: 'PAID',
      reference,
    },
  });
  await prisma.order.update({
    where: { id: matchedOrder.id },
    data: { paymentStatus: 'PAID', status: 'COMPLETED' },
  });
  emitToRestaurant(matchedOrder.restaurantId, 'payment:update', { orderId: matchedOrder.id, status: 'PAID', method: 'upi' });
  return res.json({ success: true, data: { matched: true, orderId: matchedOrder.id, shortCode: matchedOrder.orderShortCode } });
}));

// Public minimal status for customer polling during UPI checkout
app.get('/api/public/order-status/:orderId', asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: paramStr(req.params.orderId) },
    select: { paymentStatus: true },
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  return res.json({ success: true, data: { paid: order.paymentStatus === 'PAID' } });
}));

// ════════════════════════════════════════════════════════════════
//  FEEDBACK
// ════════════════════════════════════════════════════════════════

app.get('/api/feedback', requireAuth('staff'), asyncHandler(async (_req, res) => {
  res.json({ success: true, data: [] });
}));

app.post('/api/feedback', limit(writeLimiter), asyncHandler(async (req, res) => {
  const schema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
    restaurantId: z.string().max(64).optional(),
    customerId: z.string().max(64).optional(),
    orderId: z.string().max(64).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid feedback' });
  return res.status(201).json({
    success: true,
    data: { id: 'feedback-' + crypto.randomUUID(), ...parsed.data, createdAt: new Date().toISOString() },
  });
}));

app.put('/api/feedback/:id/reply', requireAuth('staff'), requireRole('owner'), asyncHandler(async (req, res) => {
  const reply = typeof req.body.reply === 'string' ? req.body.reply.slice(0, 1000) : '';
  return res.json({ success: true, data: { id: paramStr(req.params.id), reply } });
}));

// ════════════════════════════════════════════════════════════════
//  PUBLIC MENU (guest QR flow)
// ════════════════════════════════════════════════════════════════

app.get('/api/public/menu/:slug', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: paramStr(req.params.slug) },
    select: publicRestaurantFields,
  });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const categories = await prisma.category.findMany({ where: { restaurantId: restaurant.id }, orderBy: { order: 'asc' } });
  const menuItems = await prisma.menuItem.findMany({ where: { restaurantId: restaurant.id, isAvailable: true }, orderBy: { createdAt: 'asc' } });
  const tables = await prisma.table.findMany({ where: { restaurantId: restaurant.id }, orderBy: { number: 'asc' } });
  return res.json({ success: true, data: { restaurant, categories, menuItems, tables } });
}));

app.get('/api/public/menu/:slug/item/:itemId', asyncHandler(async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: paramStr(req.params.slug) } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
  const item = await prisma.menuItem.findFirst({ where: { id: paramStr(req.params.itemId), restaurantId: restaurant.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  const category = await prisma.category.findUnique({ where: { id: item.categoryId } });
  return res.json({ success: true, data: { ...item, category } });
}));

// ════════════════════════════════════════════════════════════════
//  ERROR HANDLING
// ════════════════════════════════════════════════════════════════

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]', err?.message || err);
  if (err?.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'That value already exists' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request too large' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

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
  await healEmptyRestaurant();
  await rotateSeededCredentials();
  const port = Number(process.env.PORT || 5000);
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`SERVORA backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
