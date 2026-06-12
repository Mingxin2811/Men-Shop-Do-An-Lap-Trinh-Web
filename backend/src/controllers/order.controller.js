const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { getEffectivePrice } = require("../utils/price");

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      shippingName,
      shippingPhone,
      shippingAddress,
      paymentMethod = "COD"
    } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, variant: true }
    });

    if (cartItems.length === 0) {
      return errorResponse(res, "Gio hang trong, khong the dat hang", 400);
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      if (!item.product.isActive) {
        return errorResponse(res, `San pham ${item.product.name} da bi an`, 400);
      }

      totalAmount += getEffectivePrice(item.product) * item.quantity;

      const availableStock = item.variant ? item.variant.stock : item.product.stock;
      if (availableStock < item.quantity) {
        return errorResponse(res, `San pham ${item.product.name} khong du ton kho`, 400);
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "PENDING",
          paymentStatus: paymentMethod === "COD" ? "UNPAID" : "PENDING",
          paymentMethod,
          shippingName: shippingName.trim(),
          shippingPhone: shippingPhone.trim(),
          shippingAddress: shippingAddress.trim()
        }
      });

      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            price: getEffectivePrice(item.product),
            quantity: item.quantity,
            size: item.variant?.size || null,
            color: item.variant?.color || null
          }
        });

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: { items: true }
      });
    });

    return successResponse(res, "Dat hang thanh cong", order, 201);
  } catch (error) {
    return next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" }
    });

    return successResponse(res, "Lay lich su mua hang thanh cong", orders);
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!order) {
      return errorResponse(res, "Khong tim thay don hang", 404);
    }

    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return errorResponse(res, "Ban khong co quyen xem don hang nay", 403);
    }

    return successResponse(res, "Lay chi tiet don hang thanh cong", order);
  } catch (error) {
    return next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const take = Math.max(parseInt(limit, 10) || 10, 1);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * take;
    const where = {};

    if (status) where.status = status;

    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
          payment: true
        },
        skip,
        take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.order.count({ where })
    ]);

    return successResponse(res, "Lay tat ca don hang thanh cong", {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / take),
      currentPage
    });
  } catch (error) {
    return next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return errorResponse(res, "Trang thai don hang khong hop le", 400);
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return errorResponse(res, "Khong tim thay don hang", 404);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, payment: true }
    });

    return successResponse(res, "Cap nhat trang thai don hang thanh cong", order);
  } catch (error) {
    return next(error);
  }
};

const cancelMyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return errorResponse(res, "Khong tim thay don hang", 404);
    }

    if (order.userId !== userId) {
      return errorResponse(res, "Ban khong co quyen huy don hang nay", 403);
    }

    // Khách chỉ được tự huỷ khi đơn còn chờ xử lý.
    if (order.status !== "PENDING") {
      return errorResponse(res, "Chi co the huy don hang dang cho xu ly", 400);
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Hoàn lại tồn kho đã trừ khi đặt hàng.
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          // Đơn đã thanh toán thì chuyển sang hoàn tiền, còn lại giữ nguyên trạng thái.
          ...(order.paymentStatus === "PAID" ? { paymentStatus: "REFUNDED" } : {})
        },
        include: { items: true, payment: true }
      });
    });

    return successResponse(res, "Huy don hang thanh cong", updatedOrder);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder
};
