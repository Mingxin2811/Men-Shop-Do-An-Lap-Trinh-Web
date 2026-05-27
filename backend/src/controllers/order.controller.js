import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingName, shippingPhone, shippingAddress, paymentMethod } = req.body;

    if (!shippingName || !shippingPhone || !shippingAddress) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin giao hàng" });
    }

    // Lấy giỏ hàng hiện tại để tiến hành lên đơn
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, product_variant: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Giỏ hàng trống, không thể đặt hàng" });
    }

    // Tính tổng tiền đơn hàng và kiểm tra kho đồng thời
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += Number(item.product.price) * item.quantity;
      
      if (item.variantId && item.product_variant.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm ${item.product.name} (Size/Màu) đã hết hàng hoặc không đủ.` });
      }
      if (!item.variantId && item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm ${item.product.name} đã hết hàng hoặc không đủ.` });
      }
    }

    // Thực hiện Transaction: tạo đơn hàng, tạo chi tiết đơn, trừ kho, xóa giỏ hàng
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: "PENDING",
          paymentStatus: paymentMethod === "COD" ? "UNPAID" : "PENDING",
          paymentMethod,
          shippingName,
          shippingPhone,
          shippingAddress
        }
      });

      // Tạo Order Items lưu snapshot dữ liệu lịch sử giá và thuộc tính sản phẩm
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            size: item.product_variant?.size || null,
            color: item.product_variant?.color || null
          }
        });

        // Trừ tồn kho tương ứng
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

      // Xóa sạch giỏ hàng của User sau khi tạo đơn hoàn tất
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    return res.status(201).json({ success: true, message: "Đặt hàng thành công", data: order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { order_items: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, message: "Lấy lịch sử mua hàng thành công", data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { order_items: true, user: { select: { id: true, name: true, email: true } } }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Bảo mật: Nếu là khách hàng thì chỉ được xem đơn hàng của chính mình
    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem đơn hàng này" });
    }

    return res.status(200).json({ success: true, message: "Lấy chi tiết đơn hàng thành công", data: order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy tất cả đơn hàng thành công (Admin)",
      data: { orders, totalOrders, totalPages: Math.ceil(totalOrders / take) }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Trạng thái đơn hàng không hợp lệ" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({ success: true, message: "Cập nhật trạng thái đơn hàng thành công", data: order });
  } catch (error) {
    next(error);
  }
};