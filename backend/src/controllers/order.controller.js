const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { getEffectivePrice } = require("../utils/price");
const { computeDiscount, getCouponError } = require("../utils/coupon");
const { sendMail, buildOrderConfirmationEmail } = require("../utils/mailer");

// Hoan tra ton kho cho cac item cua mot don hang khi don bi huy.
// Dung chung cho khach tu huy va admin huy don.
const restoreStock = async (tx, items) => {
  for (const item of items) {
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
};

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      shippingName,
      shippingPhone,
      shippingAddress,
      paymentMethod = "COD",
      couponCode
    } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, variant: true }
    });

    if (cartItems.length === 0) {
      return errorResponse(res, "Gio hang trong, khong the dat hang", 400);
    }

    let subtotal = 0;
    for (const item of cartItems) {
      if (!item.product.isActive) {
        return errorResponse(res, `San pham ${item.product.name} da bi an`, 400);
      }

      subtotal += getEffectivePrice(item.product) * item.quantity;

      const availableStock = item.variant ? item.variant.stock : item.product.stock;
      if (availableStock < item.quantity) {
        return errorResponse(res, `San pham ${item.product.name} khong du ton kho`, 400);
      }
    }

    // Ap dung ma giam gia (neu co). Tinh lai phia server de tranh gia mao.
    let coupon = null;
    let discountAmount = 0;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: String(couponCode).trim().toUpperCase() }
      });
      const couponError = getCouponError(coupon, subtotal);
      if (couponError) {
        return errorResponse(res, couponError, 400);
      }
      discountAmount = computeDiscount(coupon, subtotal);
    }

    const totalAmount = subtotal - discountAmount;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          discountAmount,
          couponId: coupon?.id || null,
          couponCode: coupon?.code || null,
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

        // Tru ton kho co dieu kien (chi khi stock >= quantity) trong cung 1 query,
        // tranh ban qua so luong khi nhieu don dat cung luc (race condition).
        const updated = item.variantId
          ? await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } }
            })
          : await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } }
            });

        if (updated.count === 0) {
          const stockError = new Error(`San pham ${item.product.name} khong du ton kho`);
          stockError.publicMessage = `San pham ${item.product.name} khong du ton kho`;
          throw stockError;
        }
      }

      // Ghi nhan da dung ma giam gia.
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: { items: true }
      });
    });

    // Gui email xac nhan don hang (khong chan luong dat hang neu loi).
    try {
      const { subject, text, html } = buildOrderConfirmationEmail(order, req.user);
      await sendMail({ to: req.user.email, subject, text, html });
    } catch (mailError) {
      console.error("Gui email xac nhan don hang that bai:", mailError.message);
    }

    return successResponse(res, "Dat hang thanh cong", order, 201);
  } catch (error) {
    // Loi ton kho khong du (phat hien trong transaction) -> tra ve 400 ro rang.
    if (error.publicMessage) {
      return errorResponse(res, error.publicMessage, 400);
    }
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!existingOrder) {
      return errorResponse(res, "Khong tim thay don hang", 404);
    }

    if (existingOrder.status === "CANCELLED" && status !== "CANCELLED") {
      return errorResponse(res, "Don hang da huy khong the chuyen sang trang thai khac.", 400);
    }

    const isCancelling =
      status === "CANCELLED" && existingOrder.status !== "CANCELLED";
    const shouldMarkPaid =
      status === "COMPLETED" && existingOrder.paymentStatus !== "PAID";

    const order = await prisma.$transaction(async (tx) => {
      if (isCancelling) {
        await restoreStock(tx, existingOrder.items);
      }

      await tx.order.update({
        where: { id },
        data: {
          status,
          ...(shouldMarkPaid ? { paymentStatus: "PAID" } : {}),
          ...(isCancelling && existingOrder.paymentStatus === "PAID"
            ? { paymentStatus: "REFUNDED" }
            : {})
        }
      });

      if (shouldMarkPaid) {
        const transactionId =
          existingOrder.paymentMethod === "COD" ? `COD_${Date.now()}` : undefined;

        await tx.payment.upsert({
          where: { orderId: id },
          update: {
            amount: existingOrder.totalAmount,
            status: "PAID",
            ...(transactionId ? { transactionId } : {})
          },
          create: {
            orderId: id,
            provider: existingOrder.paymentMethod === "COD" ? "COD" : "ONLINE",
            transactionId: transactionId || null,
            amount: existingOrder.totalAmount,
            status: "PAID"
          }
        });
      }

      return tx.order.findUnique({
        where: { id },
        include: { items: true, payment: true }
      });
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
      await restoreStock(tx, order.items);

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
