import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });

    // Tính tổng doanh thu thu được từ các hóa đơn đã giao thành công (COMPLETED)
    const completedOrders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      select: { totalAmount: true }
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Lấy 5 đơn hàng mới nhất để hiện bảng danh sách trên màn hình Dashboard chính
    const latestOrders = await prisma.order.findMany({
      take: 5,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin dashboard thành công",
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        latestOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const where = { role: "CUSTOMER" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, address: true, isActive: true, createdAt: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công",
      data: { users, totalUsers, totalPages: Math.ceil(totalUsers / take) }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: "Trạng thái isActive không hợp lệ" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true }
    });

    return res.status(200).json({
      success: true,
      message: isActive ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công",
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};