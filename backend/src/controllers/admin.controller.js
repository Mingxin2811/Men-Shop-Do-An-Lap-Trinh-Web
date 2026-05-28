const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalUsers, paidOrders, latestOrders] = await prisma.$transaction([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        where: {
          OR: [
            { status: "COMPLETED" },
            { paymentStatus: "PAID" }
          ]
        },
        select: { totalAmount: true }
      }),
      prisma.order.findMany({
        take: 5,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    return successResponse(res, "Lay thong tin dashboard thanh cong", {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      latestOrders
    });
  } catch (error) {
    return next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
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

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
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

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus
};
