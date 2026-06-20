const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { getMailConfigStatus, verifyMailConnection } = require("../utils/mailer");

const REVENUE_WHERE = {
  OR: [{ status: "COMPLETED" }, { paymentStatus: "PAID" }]
};

const getDashboardStats = async (req, res, next) => {
  try {
    // Mốc 7 ngày gần nhất (gồm hôm nay).
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6);

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      paidOrders,
      latestOrders,
      ordersByStatusRaw,
      topProductsRaw,
      recentRevenueOrders
    ] = await prisma.$transaction([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({ where: REVENUE_WHERE, select: { totalAmount: true } }),
      prisma.order.findMany({
        take: 5,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5
      }),
      prisma.order.findMany({
        where: { ...REVENUE_WHERE, createdAt: { gte: since } },
        select: { totalAmount: true, createdAt: true }
      })
    ]);

    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Doanh thu theo tung ngay trong 7 ngay gan nhat.
    const dayKeys = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      dayKeys.push(d.toISOString().slice(0, 10));
    }
    const revenueMap = Object.fromEntries(dayKeys.map((k) => [k, 0]));
    for (const order of recentRevenueOrders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      if (revenueMap[key] !== undefined) revenueMap[key] += Number(order.totalAmount);
    }
    const revenueByDay = dayKeys.map((date) => ({ date, revenue: revenueMap[date] }));

    const ordersByStatus = ordersByStatusRaw.map((row) => ({
      status: row.status,
      count: row._count._all
    }));

    const topProducts = topProductsRaw.map((row) => ({
      name: row.productName,
      quantity: row._sum.quantity || 0
    }));

    return successResponse(res, "Lay thong tin dashboard thanh cong", {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      latestOrders,
      revenueByDay,
      ordersByStatus,
      topProducts
    });
  } catch (error) {
    return next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search, isActive, page = 1, limit = 10 } = req.query;
    const take = Math.max(parseInt(limit, 10) || 10, 1);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * take;
    const where = { role: "CUSTOMER" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    if (isActive === "true" || isActive === "false") {
      where.isActive = isActive === "true";
    }

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          phone: true,
          address: true,
          isActive: true,
          createdAt: true
        },
        skip,
        take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ]);

    return successResponse(res, "Lay danh sach nguoi dung thanh cong", {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / take),
      currentPage
    });
  } catch (error) {
    return next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
      select: { id: true }
    });

    if (!user) {
      return errorResponse(res, "Khong tim thay khach hang", 404);
    }

    const orders = await prisma.order.findMany({
      where: { userId: id },
      include: {
        items: true,
        payment: true
      },
      orderBy: { createdAt: "desc" }
    });

    return successResponse(res, "Lay lich su mua hang thanh cong", orders);
  } catch (error) {
    return next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== "CUSTOMER") {
      return errorResponse(res, "Khong tim thay khach hang", 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true }
    });

    return successResponse(
      res,
      isActive ? "Mo khoa tai khoan thanh cong" : "Khoa tai khoan thanh cong",
      updatedUser
    );
  } catch (error) {
    return next(error);
  }
};

const getMailStatus = async (req, res, next) => {
  try {
    const status = getMailConfigStatus();
    const shouldVerify = req.query.verify === "true";

    if (!shouldVerify) {
      return successResponse(res, "Lay cau hinh SMTP thanh cong", status);
    }

    try {
      await verifyMailConnection();
      return successResponse(res, "Ket noi SMTP thanh cong", {
        ...status,
        verified: true
      });
    } catch (error) {
      return successResponse(res, "Ket noi SMTP that bai", {
        ...status,
        verified: false,
        error: error.message
      });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserOrders,
  updateUserStatus,
  getMailStatus
};
