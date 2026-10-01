const prisma = require('../utils/prisma');

// ─── Orders ──────────────────────────────────────────────────────────────────

const VALID_ORDER_STATUSES = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];

const getAllOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0, date } = req.query;

    // Validate and clamp limit/offset — prevent full-table dumps
    const take = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const skip = Math.max(parseInt(offset) || 0, 0);

    const where = {};

    // Validate status enum before passing to Prisma
    if (status) {
      const s = status.toUpperCase();
      if (!VALID_ORDER_STATUSES.includes(s)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Use one of: ${VALID_ORDER_STATUSES.join(', ')}`,
        });
      }
      where.status = s;
    }

    // Validate date param before constructing range
    if (date) {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.createdAt = { gte: d, lt: nextDay };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, studentId: true, phone: true } },
          items: { include: { foodItem: { select: { name: true, category: true, prepTimeMinutes: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, total });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACCEPTED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];
    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ success: false, message: `Invalid status. Use: ${validStatuses.join(', ')}` });
    }

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Enforce valid transitions
    const transitions = {
      PENDING: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY'],
      READY: ['COLLECTED'],
      COLLECTED: [],
      CANCELLED: [],
    };
    const newStatus = status.toUpperCase();
    if (!transitions[order.status]?.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${newStatus}. Allowed: ${transitions[order.status].join(', ') || 'none'}`,
      });
    }

    const timestamps = {
      ACCEPTED: { acceptedAt: new Date() },
      PREPARING: { preparingAt: new Date() },
      READY: { readyAt: new Date() },
      COLLECTED: { collectedAt: new Date() },
      CANCELLED: { cancelledAt: new Date() },
    };

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: newStatus, ...timestamps[newStatus] },
      include: {
        user: { select: { name: true, email: true, studentId: true } },
        items: { include: { foodItem: { select: { name: true } } } },
      },
    });

    res.json({ success: true, message: `Order status updated to ${newStatus}`, order: updated });
  } catch (error) {
    next(error);
  }
};

// ─── Kitchen Queue ────────────────────────────────────────────────────────────

const getKitchenQueue = async (req, res, next) => {
  try {
    const activeOrders = await prisma.order.findMany({
      where: { status: { in: ['ACCEPTED', 'PREPARING', 'PENDING'] } },
      include: {
        user: { select: { name: true, studentId: true } },
        items: {
          include: {
            foodItem: { select: { name: true, category: true, prepTimeMinutes: true, image: true } },
          },
        },
      },
      orderBy: { pickupTime: 'asc' },
      take: 100, // cap at 100 active orders to prevent unbounded memory usage
    });

    // Add urgency flag for orders picking up in < 15 min
    const now = new Date();
    const queue = activeOrders.map((order) => {
      const minutesUntilPickup = Math.round((new Date(order.pickupTime) - now) / 60000);
      return {
        ...order,
        minutesUntilPickup,
        isUrgent: minutesUntilPickup <= 15 && minutesUntilPickup >= 0,
        isOverdue: minutesUntilPickup < 0,
      };
    });

    res.json({ success: true, queue, count: queue.length });
  } catch (error) {
    next(error);
  }
};

// ─── Analytics ───────────────────────────────────────────────────────────────

const getAnalytics = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      ordersByStatus,
      revenueResult,
      topItems,
      hourlyDistribution,
      avgPrepTime,
      todayOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: since } } }),

      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),

      prisma.order.aggregate({
        where: { createdAt: { gte: since }, status: { in: ['COLLECTED', 'READY'] } },
        _sum: { totalAmount: true },
      }),

      prisma.orderItem.groupBy({
        by: ['foodItemId'],
        where: { order: { createdAt: { gte: since } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      prisma.$queryRaw`
        SELECT EXTRACT(HOUR FROM "created_at")::int as hour, COUNT(*)::int as count
        FROM orders
        WHERE "created_at" >= ${since}
        GROUP BY EXTRACT(HOUR FROM "created_at")
        ORDER BY hour
      `,

      prisma.order.aggregate({
        where: { createdAt: { gte: since }, status: 'COLLECTED' },
        _avg: { estimatedPrepTime: true },
      }),

      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    // Resolve top item names — fix N+1 with a single query
    const foodItemIds = topItems.map(i => i.foodItemId);
    const foodDetails = await prisma.foodItem.findMany({
      where: { id: { in: foodItemIds } },
      select: { id: true, name: true, category: true },
    });
    const foodMap = Object.fromEntries(foodDetails.map(f => [f.id, f]));
    const topItemsWithNames = topItems.map(item => ({
      ...foodMap[item.foodItemId],
      totalOrdered: item._sum.quantity,
    })).filter(i => i.name); // exclude any orphaned items

    const statusMap = {};
    ordersByStatus.forEach((s) => { statusMap[s.status] = s._count.id; });

    res.json({
      success: true,
      period: `Last ${days} days`,
      summary: {
        totalOrders,
        todayOrders,
        totalRevenue: parseFloat((revenueResult._sum.totalAmount || 0).toFixed(2)),
        avgPrepTimeMinutes: Math.round(avgPrepTime._avg.estimatedPrepTime || 0),
        completionRate: totalOrders > 0
          ? Math.round(((statusMap.COLLECTED || 0) / totalOrders) * 100)
          : 0,
      },
      ordersByStatus: statusMap,
      topItems: topItemsWithNames,
      hourlyDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Dashboard Summary ────────────────────────────────────────────────────────

const getDashboardSummary = async (req, res, next) => {
  try {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [activeOrders, todayOrders, pendingOrders, totalStudents, menuItemCount] = await Promise.all([
      prisma.order.count({ where: { status: { in: ['ACCEPTED', 'PREPARING', 'PENDING'] } } }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.foodItem.count(),
    ]);

    const todayRevenue = await prisma.order.aggregate({
      where: { createdAt: { gte: todayStart }, status: { in: ['COLLECTED', 'READY'] } },
      _sum: { totalAmount: true },
    });

    res.json({
      success: true,
      summary: {
        activeOrders,
        todayOrders,
        pendingOrders,
        totalStudents,
        menuItemCount,
        todayRevenue: parseFloat((todayRevenue._sum.totalAmount || 0).toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllOrders, updateOrderStatus, getKitchenQueue, getAnalytics, getDashboardSummary };
