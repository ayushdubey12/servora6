import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from './lib/prisma.js';

const SECRET = process.env.JWT_SECRET || 'insecure-dev-secret-do-not-use-in-production';

const adminRouter = Router();

// ── Helpers ─────────────────────────────────────────────────────
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function paramId(req: Request): string {
  return String(req.params.id || '');
}

function requireAuth(req: Request, res: Response): { sub: string; role: string } | null {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return null;
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET) as any;
    if (payload.type !== 'staff' || payload.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return null;
    }
    return payload;
  } catch {
    res.status(401).json({ success: false, message: 'Session expired' });
    return null;
  }
}

// ════════════════════════════════════════════════════════════════
//  ADMIN AUTH
// ════════════════════════════════════════════════════════════════

adminRouter.post('/login', asyncHandler(async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { sub: user.id, role: 'admin', restaurantId: null, type: 'staff' },
    SECRET,
    { expiresIn: '12h' }
  );

  return res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
}));

adminRouter.get('/profile', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ success: false, message: 'Admin not found' });
  return res.json({ success: true, data: user });
}));

// ════════════════════════════════════════════════════════════════
//  PLATFORM STATS
// ════════════════════════════════════════════════════════════════

adminRouter.get('/stats', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const [
    totalRestaurants,
    totalUsers,
    totalCustomers,
    totalOrders,
    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    prisma.restaurant.count(),
    prisma.user.count({ where: { role: { in: ['owner', 'waiter', 'chef'] } } }),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        restaurant: { select: { name: true } },
      },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.amount || 0;

  // Revenue by restaurant
  const revenueByRestaurant = await prisma.payment.groupBy({
    by: ['orderId'],
    _sum: { amount: true },
    where: { status: 'PAID' },
  });

  // Get restaurant names for revenue
  const orderIds = revenueByRestaurant.map(r => r.orderId);
  const ordersWithRestaurants = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true, restaurantId: true, restaurant: { select: { name: true } } },
  });
  const orderIdToRestaurant = new Map(ordersWithRestaurants.map(o => [o.id, o.restaurant.name]));

  const restaurantRevenue: Record<string, number> = {};
  revenueByRestaurant.forEach(r => {
    const name = orderIdToRestaurant.get(r.orderId) || 'Unknown';
    restaurantRevenue[name] = (restaurantRevenue[name] || 0) + (r._sum.amount || 0);
  });

  return res.json({
    success: true,
    data: {
      totalRestaurants,
      totalUsers,
      totalCustomers,
      totalOrders,
      totalRevenue,
      recentOrders,
      restaurantRevenue,
    },
  });
}));

// ════════════════════════════════════════════════════════════════
//  RESTAURANT MANAGEMENT
// ════════════════════════════════════════════════════════════════

adminRouter.get('/restaurants', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true, menuItems: true, orders: true, customers: true, tables: true },
      },
      subscriptions: { where: { status: 'active' }, take: 1 },
    },
  });

  // Get revenue per restaurant
  const restaurantIds = restaurants.map(r => r.id);
  const revenueAgg = await prisma.payment.groupBy({
    by: ['orderId'],
    _sum: { amount: true },
    where: { status: 'PAID', order: { restaurantId: { in: restaurantIds } } },
  });

  const orderIds = revenueAgg.map(r => r.orderId);
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true, restaurantId: true },
  });
  const revMap: Record<string, number> = {};
  revenueAgg.forEach(r => {
    const order = orders.find(o => o.id === r.orderId);
    if (order) {
      revMap[order.restaurantId] = (revMap[order.restaurantId] || 0) + (r._sum.amount || 0);
    }
  });

  const enriched = restaurants.map(r => ({
    ...r,
    totalRevenue: revMap[r.id] || 0,
    subscription: r.subscriptions[0] || null,
    _count: r._count,
  }));

  return res.json({ success: true, data: enriched });
}));

adminRouter.get('/restaurants/:id', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: paramId(req) },
    include: {
      users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      _count: { select: { menuItems: true, orders: true, customers: true, tables: true, categories: true } },
      subscriptions: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

  // Revenue stats
  const payments = await prisma.payment.findMany({
    where: { status: 'PAID', order: { restaurantId: restaurant.id } },
    select: { amount: true, createdAt: true },
  });
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true, tableNumber: true, customerName: true, status: true,
      paymentStatus: true, total: true, createdAt: true,
    },
  });

  return res.json({
    success: true,
    data: {
      ...restaurant,
      totalRevenue,
      recentOrders,
    },
  });
}));

adminRouter.put('/restaurants/:id', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const schema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().max(120).optional(),
    address: z.string().max(300).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid data', errors: parsed.error.flatten() });
  }

  const restaurant = await prisma.restaurant.update({
    where: { id: paramId(req) },
    data: parsed.data,
  });
  return res.json({ success: true, data: restaurant });
}));

// ════════════════════════════════════════════════════════════════
//  SUBSCRIPTION MANAGEMENT
// ════════════════════════════════════════════════════════════════

adminRouter.post('/restaurants/:id/subscription', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const schema = z.object({
    plan: z.enum(['basic', 'premium']),
    setupFee: z.number().min(0),
    annualFee: z.number().min(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid subscription data' });
  }

  // Deactivate existing
  await prisma.subscription.updateMany({
    where: { restaurantId: paramId(req), status: 'active' },
    data: { status: 'cancelled' },
  });

  const subscription = await prisma.subscription.create({
    data: {
      restaurantId: paramId(req),
      plan: parsed.data.plan,
      setupFee: parsed.data.setupFee,
      annualFee: parsed.data.annualFee,
      nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return res.json({ success: true, data: subscription });
}));

// ════════════════════════════════════════════════════════════════
//  CUSTOMER MANAGEMENT (cross-restaurant)
// ════════════════════════════════════════════════════════════════

adminRouter.get('/customers', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, phone: true,
      points: true, totalSpent: true, visitCount: true, createdAt: true,
      restaurant: { select: { id: true, name: true } },
      _count: { select: { orders: true } },
    },
  });

  return res.json({ success: true, data: customers });
}));

adminRouter.get('/customers/export', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      name: true, email: true, phone: true,
      points: true, totalSpent: true, visitCount: true, createdAt: true,
      restaurant: { select: { name: true } },
    },
  });

  // CSV format
  const header = 'Name,Email,Phone,Restaurant,Points,Total Spent,Visits,Created At\n';
  const rows = customers.map(c =>
    `"${c.name}","${c.email}","${c.phone || ''}","${c.restaurant?.name || ''}",${c.points},${c.totalSpent},${c.visitCount},"${c.createdAt.toISOString()}"`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="servora-customers.csv"');
  return res.send(header + rows);
}));

// ════════════════════════════════════════════════════════════════
//  REVENUE TRACKING
// ════════════════════════════════════════════════════════════════

adminRouter.get('/revenue', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const entries = await prisma.revenue.findMany({
    orderBy: { date: 'desc' },
    include: { restaurant: { select: { id: true, name: true } } },
  });

  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  // Revenue by type
  const byType: Record<string, number> = {};
  entries.forEach(e => { byType[e.type] = (byType[e.type] || 0) + e.amount; });

  // Revenue by month
  const byMonth: Record<string, number> = {};
  entries.forEach(e => {
    const month = e.date.toISOString().slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + e.amount;
  });

  return res.json({ success: true, data: { entries, total, byType, byMonth } });
}));

adminRouter.post('/revenue', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const schema = z.object({
    restaurantId: z.string(),
    amount: z.number().min(0),
    type: z.enum(['setup', 'annual', 'data_addon', 'hardware']),
    description: z.string().max(200).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid revenue data' });
  }

  const entry = await prisma.revenue.create({ data: parsed.data });
  return res.json({ success: true, data: entry });
}));

// ════════════════════════════════════════════════════════════════
//  USER MANAGEMENT
// ════════════════════════════════════════════════════════════════

adminRouter.get('/users', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      restaurant: { select: { id: true, name: true } },
    },
  });

  return res.json({ success: true, data: users });
}));

adminRouter.post('/users', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const schema = z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().max(120),
    password: z.string().min(8).max(128),
    role: z.enum(['owner', 'waiter', 'chef', 'admin']),
    restaurantId: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid user data', errors: parsed.error.flatten() });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await bcrypt.hash(parsed.data.password, 10),
      role: parsed.data.role,
      restaurantId: parsed.data.restaurantId || null,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return res.json({ success: true, data: user });
}));

adminRouter.delete('/users/:id', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  if (paramId(req) === auth.sub) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }

  await prisma.user.delete({ where: { id: paramId(req) } });
  return res.json({ success: true, data: { deleted: true } });
}));

// ════════════════════════════════════════════════════════════════
//  SYSTEM HEALTH
// ════════════════════════════════════════════════════════════════

adminRouter.get('/health', asyncHandler(async (req, res) => {
  const auth = requireAuth(req, res);
  if (!auth) return;

  const [restaurants, users, customers, orders, payments] = await Promise.all([
    prisma.restaurant.count(),
    prisma.user.count(),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.payment.count(),
  ]);

  return res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      tableCounts: { restaurants, users, customers, orders, payments },
      timestamp: new Date().toISOString(),
    },
  });
}));

export default adminRouter;
