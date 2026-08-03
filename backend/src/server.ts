import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'SERVORA backend is running' });
});

function parseJsonValue(value: string | null | undefined) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function getLatestRestaurant() {
  return prisma.restaurant.findFirst({ orderBy: { createdAt: 'desc' } });
}

async function updateRestaurantOnboarding(restaurantId: string, onboardingData: Record<string, unknown>) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) return null;

  const currentSettings = parseJsonValue(restaurant.settings);
  return prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      settings: JSON.stringify({
        ...(currentSettings as Record<string, unknown>),
        onboarding: onboardingData,
      }),
    },
  });
}

async function seedDefaultData() {
  const existingRestaurant = await prisma.restaurant.findFirst({ where: { slug: 'demo-restaurant' } });
  if (existingRestaurant) return existingRestaurant;

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
      description: 'Demo restaurant',
      phone: '+1 555 000 0000',
      email: 'hello@demo.com',
      address: '123 Demo Street',
      openingHours: JSON.stringify({
        mon: { open: '11:00', close: '22:00' },
        tue: { open: '11:00', close: '22:00' },
        wed: { open: '11:00', close: '22:00' },
        thu: { open: '11:00', close: '23:00' },
        fri: { open: '11:00', close: '23:00' },
        sat: { open: '10:00', close: '23:00' },
        sun: { open: '10:00', close: '21:00' },
      }),
      settings: JSON.stringify({}),
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.createMany({
    data: [
      { name: 'Owner Demo', email: 'owner@demo.com', password: passwordHash, role: 'owner', restaurantId: restaurant.id },
      { name: 'Chef Demo', email: 'chef@demo.com', password: passwordHash, role: 'chef', restaurantId: restaurant.id },
      { name: 'Wendy Waiter', email: 'waiter@demo.com', password: passwordHash, role: 'waiter', restaurantId: restaurant.id },
      { name: 'Walt Waiter', email: 'waiter2@demo.com', password: passwordHash, role: 'waiter', restaurantId: restaurant.id },
    ],
  });

  const [starter, main, dessert] = await Promise.all([
    prisma.category.create({ data: { name: 'Starters', slug: 'starters', itemCount: 2, order: 1, restaurantId: restaurant.id } }),
    prisma.category.create({ data: { name: 'Mains', slug: 'mains', itemCount: 2, order: 2, restaurantId: restaurant.id } }),
    prisma.category.create({ data: { name: 'Desserts', slug: 'desserts', itemCount: 1, order: 3, restaurantId: restaurant.id } }),
  ]);

  await Promise.all([
    prisma.menuItem.create({ data: { name: 'Truffle Burrata', description: 'Fresh burrata and tomato', price: 18, categoryId: starter.id, restaurantId: restaurant.id, isVeg: true, isAvailable: true } }),
    prisma.menuItem.create({ data: { name: 'Ribeye Steak', description: 'Prime ribeye with garlic butter', price: 42, categoryId: main.id, restaurantId: restaurant.id, isVeg: false, isAvailable: true } }),
    prisma.menuItem.create({ data: { name: 'Chocolate Fondant', description: 'Warm chocolate fondant', price: 14, categoryId: dessert.id, restaurantId: restaurant.id, isVeg: true, isAvailable: true } }),
    prisma.menuItem.create({ data: { name: 'Wild Mushroom Risotto', description: 'Creamy mushroom risotto', price: 24, categoryId: main.id, restaurantId: restaurant.id, isVeg: true, isAvailable: true } }),
  ]);

  await Promise.all([
    prisma.table.create({ data: { number: 1, seats: 2, status: 'available', restaurantId: restaurant.id } }),
    prisma.table.create({ data: { number: 2, seats: 4, status: 'occupied', restaurantId: restaurant.id } }),
  ]);

  return restaurant;
}

app.post('/api/auth/register', async (req, res) => {
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

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: passwordHash,
      role: 'owner',
      restaurantId: restaurant.id,
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      token: 'dev-token',
      refreshToken: 'dev-refresh-token',
    },
  });
});

app.post('/api/auth/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(parsed.data.password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const restaurant = user.restaurantId ? await prisma.restaurant.findUnique({ where: { id: user.restaurantId } }) : null;

  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      restaurant: {
        id: restaurant?.id || 'rest_1',
        name: restaurant?.name || 'Demo Restaurant',
        slug: restaurant?.slug || 'demo-restaurant',
      },
      token: 'dev-token',
      refreshToken: 'dev-refresh-token',
    },
  });
});

app.get('/api/restaurant', async (_req, res) => {
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: 'demo-restaurant' } });
  res.json({ success: true, data: restaurant });
});

app.get('/api/onboarding/status', async (req, res) => {
  const restaurant = await getLatestRestaurant();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const settings = parseJsonValue(restaurant.settings);
  return res.json({ success: true, data: { restaurant, onboarding: settings.onboarding || {} } });
});

app.post('/api/onboarding/restaurant', async (req, res) => {
  const restaurant = await getLatestRestaurant();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const currentSettings = parseJsonValue(restaurant.settings);
  const nextSettings = {
    ...(currentSettings as Record<string, unknown>),
    onboarding: {
      ...(currentSettings.onboarding as Record<string, unknown> || {}),
      restaurant: req.body,
    },
  };

  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: req.body.name || restaurant.name,
      description: req.body.description || restaurant.description,
      phone: req.body.phone || restaurant.phone,
      email: req.body.email || restaurant.email,
      address: req.body.address || restaurant.address,
      settings: JSON.stringify(nextSettings),
    },
  });

  return res.json({ success: true, data: updated });
});

app.post('/api/onboarding/branch', async (req, res) => {
  const restaurant = await getLatestRestaurant();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const currentSettings = parseJsonValue(restaurant.settings);
  const nextSettings = {
    ...(currentSettings as Record<string, unknown>),
    onboarding: {
      ...(currentSettings.onboarding as Record<string, unknown> || {}),
      branch: req.body,
    },
  };

  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify(nextSettings) },
  });

  return res.json({ success: true, data: updated });
});

app.post('/api/onboarding/tables', async (req, res) => {
  const restaurant = await getLatestRestaurant();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const tables = Array.isArray(req.body.tables) ? req.body.tables : [];
  const created = await Promise.all(tables.map((table: any) => prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      number: Number(table.number),
      seats: Number(table.seats),
      status: table.status || 'available',
    },
  })));

  const currentSettings = parseJsonValue(restaurant.settings);
  const nextSettings = {
    ...(currentSettings as Record<string, unknown>),
    onboarding: {
      ...(currentSettings.onboarding as Record<string, unknown> || {}),
      tables: tables,
    },
  };

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify(nextSettings) },
  });

  return res.json({ success: true, data: created });
});

app.post('/api/onboarding/menu', async (req, res) => {
  const restaurant = await getLatestRestaurant();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const categories = Array.isArray(req.body.categories) ? req.body.categories : [];
  const createdCategories = await Promise.all(categories.map(async (category: any) => prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      order: 1,
    },
  })));

  const menuItems = Array.isArray(req.body.menuItems) ? req.body.menuItems : [];
  const createdItems = await Promise.all(menuItems.map(async (item: any) => {
    const category = createdCategories[0] ?? await prisma.category.findFirst({ where: { restaurantId: restaurant.id } });
    return prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: category?.id || createdCategories[0]?.id || '',
        name: item.name,
        description: item.description,
        price: Number(item.price),
        isVeg: item.isVeg ?? true,
        isAvailable: item.isAvailable ?? true,
      },
    });
  }));

  const currentSettings = parseJsonValue(restaurant.settings);
  const nextSettings = {
    ...(currentSettings as Record<string, unknown>),
    onboarding: {
      ...(currentSettings.onboarding as Record<string, unknown> || {}),
      menu: req.body,
    },
  };

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify(nextSettings) },
  });

  return res.json({ success: true, data: { categories: createdCategories, menuItems: createdItems } });
});

app.post('/api/onboarding/payments', async (req, res) => {
  const restaurant = await getLatestRestaurant();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const currentSettings = parseJsonValue(restaurant.settings);
  const nextSettings = {
    ...(currentSettings as Record<string, unknown>),
    onboarding: {
      ...(currentSettings.onboarding as Record<string, unknown> || {}),
      payments: req.body,
    },
  };

  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify(nextSettings) },
  });

  return res.json({ success: true, data: updated });
});

app.post('/api/onboarding/complete', async (req, res) => {
  const restaurant = await getLatestRestaurant();
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const currentSettings = parseJsonValue(restaurant.settings);
  const nextSettings = {
    ...(currentSettings as Record<string, unknown>),
    onboarding: {
      ...(currentSettings.onboarding as Record<string, unknown> || {}),
      completed: true,
      completedAt: new Date().toISOString(),
      notes: req.body.notes || 'Onboarding finished',
    },
  };

  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { settings: JSON.stringify(nextSettings) },
  });

  return res.json({ success: true, data: updated });
});

app.get('/api/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  res.json({ success: true, data: categories });
});

app.post('/api/categories', async (req, res) => {
  const schema = z.object({ name: z.string().min(1), slug: z.string().min(1).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }

  const restaurant = await seedDefaultData();
  const newCategory = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug || parsed.data.name.toLowerCase().replace(/\s+/g, '-'),
      itemCount: 0,
      order: (await prisma.category.count({ where: { restaurantId: restaurant.id } })) + 1,
      restaurantId: restaurant.id,
    },
  });
  return res.status(201).json({ success: true, data: newCategory });
});

app.put('/api/categories/:id', async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const updated = await prisma.category.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name || category.name,
      slug: req.body.slug || category.slug,
    },
  });
  return res.json({ success: true, data: updated });
});

app.delete('/api/categories/:id', async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  await prisma.category.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { id: req.params.id } });
});

app.get('/api/menu-items', async (_req, res) => {
  const menuItems = await prisma.menuItem.findMany({ orderBy: { createdAt: 'asc' } });
  res.json({ success: true, data: menuItems });
});

app.post('/api/menu-items', async (req, res) => {
  const schema = z.object({ name: z.string().min(1), description: z.string().min(1), price: z.number().min(0), categoryId: z.string().min(1), isVeg: z.boolean().optional(), isAvailable: z.boolean().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }

  const restaurant = await seedDefaultData();
  const newItem = await prisma.menuItem.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      restaurantId: restaurant.id,
      isVeg: parsed.data.isVeg ?? true,
      isAvailable: parsed.data.isAvailable ?? true,
    },
  });
  return res.status(201).json({ success: true, data: newItem });
});

app.put('/api/menu-items/:id', async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

  const updated = await prisma.menuItem.update({ where: { id: req.params.id }, data: req.body });
  return res.json({ success: true, data: updated });
});

app.delete('/api/menu-items/:id', async (req, res) => {
  const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

  await prisma.menuItem.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { id: req.params.id } });
});

app.get('/api/tables', async (_req, res) => {
  const tables = await prisma.table.findMany({ orderBy: { number: 'asc' } });
  res.json({ success: true, data: tables });
});

app.post('/api/tables', async (req, res) => {
  const schema = z.object({ number: z.number().int().positive(), seats: z.number().int().positive(), status: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }

  const restaurant = await seedDefaultData();
  const newTable = await prisma.table.create({
    data: {
      number: parsed.data.number,
      seats: parsed.data.seats,
      status: parsed.data.status || 'available',
      restaurantId: restaurant.id,
    },
  });
  return res.status(201).json({ success: true, data: newTable });
});

app.put('/api/tables/:id', async (req, res) => {
  const table = await prisma.table.findUnique({ where: { id: req.params.id } });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

  const updated = await prisma.table.update({ where: { id: req.params.id }, data: req.body });
  return res.json({ success: true, data: updated });
});

app.delete('/api/tables/:id', async (req, res) => {
  const table = await prisma.table.findUnique({ where: { id: req.params.id } });
  if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

  await prisma.table.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { id: req.params.id } });
});

app.get('/api/orders', async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: orders });
});

app.get('/api/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  return res.json({ success: true, data: order });
});

app.post('/api/orders', async (req, res) => {
  const schema = z.object({
    restaurantId: z.string().min(1),
    tableNumber: z.number().int().positive(),
    customerName: z.string().min(1),
    items: z.array(z.object({ itemId: z.string(), quantity: z.number().int().positive() })),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: parsed.data.restaurantId } });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  const subtotal = await parsed.data.items.reduce(async (sumPromise, item) => {
    const sum = await sumPromise;
    const menuItem = await prisma.menuItem.findUnique({ where: { id: item.itemId } });
    return sum + (menuItem?.price || 0) * item.quantity;
  }, Promise.resolve(0));
  const tax = subtotal * 0.09;
  const total = subtotal + tax;

  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: parsed.data.tableNumber,
      customerName: parsed.data.customerName,
      subtotal,
      tax,
      total,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: {
        create: await Promise.all(parsed.data.items.map(async (entry) => {
          const menuItem = await prisma.menuItem.findUnique({ where: { id: entry.itemId } });
          return {
            itemId: entry.itemId,
            quantity: entry.quantity,
            price: menuItem?.price || 0,
          };
        })),
      },
    },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });

  io.emit('order:new', order);
  return res.status(201).json({ success: true, data: order });
});

app.put('/api/orders/:id/status', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
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
    where: { id: req.params.id },
    data: {
      status: nextStatus,
      paymentStatus: nextStatus === 'PAID' || nextStatus === 'COMPLETED' ? 'PAID' : order.paymentStatus,
    },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });
  io.emit('order:update', updated);
  return res.json({ success: true, data: updated });
});

// ===== Waiter / Staff management =====
app.get('/api/waiters', async (_req, res) => {
  const waiters = await prisma.user.findMany({
    where: { role: { in: ['waiter', 'chef'] } },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: waiters });
});

app.post('/api/waiters', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8).optional(),
    role: z.enum(['waiter', 'chef']).default('waiter'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ success: false, message: 'A user with this email already exists' });

  const restaurant = await getLatestRestaurant();
  const passwordHash = await bcrypt.hash(parsed.data.password || 'password123', 10);
  const waiter = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: passwordHash,
      role: parsed.data.role,
      restaurantId: restaurant?.id || null,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  io.emit('waiter:new', waiter);
  return res.status(201).json({ success: true, data: waiter });
});

app.delete('/api/waiters/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' });
  if (user.role === 'owner') return res.status(400).json({ success: false, message: 'Cannot remove the owner' });
  await prisma.order.updateMany({ where: { claimedById: req.params.id }, data: { claimedById: null } });
  await prisma.user.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { id: req.params.id } });
});

// ===== Order claiming (waiter picks up an order; only one can) =====
app.put('/api/orders/:id/claim', async (req, res) => {
  const schema = z.object({ waiterId: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'waiterId is required' });
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.claimedById && order.claimedById !== parsed.data.waiterId) {
    return res.status(409).json({ success: false, message: 'Order already claimed by another waiter' });
  }

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      claimedById: parsed.data.waiterId,
      status: order.status === 'PENDING' ? 'ACCEPTED' : order.status,
    },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });
  io.emit('order:update', updated);
  return res.json({ success: true, data: updated });
});

app.put('/api/orders/:id/release', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { claimedById: null, status: order.status === 'ACCEPTED' ? 'PENDING' : order.status },
    include: { items: true, claimedBy: { select: { id: true, name: true, role: true } } },
  });
  io.emit('order:update', updated);
  return res.json({ success: true, data: updated });
});

// ===== Waiter performance stats for owner dashboard =====
app.get('/api/stats/waiters', async (_req, res) => {
  const waiters = await prisma.user.findMany({
    where: { role: 'waiter' },
    select: { id: true, name: true, email: true },
  });

  const stats = await Promise.all(waiters.map(async (waiter) => {
    const claimed = await prisma.order.findMany({ where: { claimedById: waiter.id } });
    const fulfilled = claimed.filter((o) => ['SERVED', 'PAID', 'COMPLETED'].includes(o.status));
    const active = claimed.filter((o) => !['SERVED', 'PAID', 'COMPLETED', 'CANCELLED'].includes(o.status));
    const revenue = fulfilled.reduce((sum, o) => sum + o.total, 0);
    return {
      id: waiter.id,
      name: waiter.name,
      email: waiter.email,
      claimed: claimed.length,
      fulfilled: fulfilled.length,
      active: active.length,
      revenue: Math.round(revenue * 100) / 100,
    };
  }));

  stats.sort((a, b) => b.fulfilled - a.fulfilled);
  return res.json({ success: true, data: stats });
});

app.post('/api/payments/create', async (req, res) => {
  const schema = z.object({ orderId: z.string(), amount: z.number().positive(), method: z.enum(['online', 'counter']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const payment = await prisma.payment.create({
    data: {
      orderId: parsed.data.orderId,
      amount: parsed.data.amount,
      method: parsed.data.method,
      status: parsed.data.method === 'counter' ? 'PAID' : 'PENDING',
    },
  });

  const updatedOrder = await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: {
      paymentStatus: payment.status === 'PAID' ? 'PAID' : 'PENDING',
      status: payment.status === 'PAID' ? 'COMPLETED' : order.status,
    },
  });
  io.emit('payment:update', { ...payment, order: updatedOrder });
  return res.json({ success: true, data: payment });
});

app.get('/api/payments', async (_req, res) => {
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: payments });
});

io.on('connection', (socket) => {
  socket.on('join:restaurant', (restaurantId: string) => {
    socket.join(restaurantId);
  });
});

async function startServer() {
  await prisma.$connect();
  await seedDefaultData();
  const port = Number(process.env.PORT || 5000);
  httpServer.listen(port, () => {
    console.log(`SERVORA backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
