const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getApiBaseUrl = (req) => {
  return process.env.API_URL || `${req.protocol}://${req.get("host")}`;
};

const createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      return errorResponse(res, "Khong tim thay don hang hop le", 404);
    }

    if (order.paymentStatus === "PAID") {
      return errorResponse(res, "Don hang nay da thanh toan", 400);
    }

    if (order.paymentMethod === "COD") {
      return errorResponse(res, "Don hang COD khong can checkout online", 400);
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const checkoutUrl = `${clientUrl}/payment-checkout?orderId=${orderId}`;

    return successResponse(res, "Tao phien thanh toan gia lap thanh cong", {
      checkoutUrl,
      successUrl: `${clientUrl}/payment-success?orderId=${orderId}`,
      cancelUrl: `${clientUrl}/payment-cancel?orderId=${orderId}`
    });
  } catch (error) {
    return next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== req.user.id) {
      return errorResponse(res, "Không tìm thấy đơn hàng hợp lệ", 404);
    }
    if (order.paymentMethod === "COD") {
      return errorResponse(res, "Đơn COD không hỗ trợ thanh toán online", 400);
    }
    if (order.status === "CANCELLED") {
      return errorResponse(res, "Đơn hàng đã bị hủy", 400);
    }
    if (order.paymentStatus === "PAID") {
      return successResponse(res, "Đơn hàng đã được thanh toán", { orderId });
    }

    await markPaymentSuccess(orderId);
    return successResponse(res, "Thanh toán thành công", { orderId });
  } catch (error) {
    return next(error);
  }
};

const cancelPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== req.user.id) {
      return errorResponse(res, "Không tìm thấy đơn hàng hợp lệ", 404);
    }
    if (order.paymentStatus === "PAID") {
      return errorResponse(res, "Đơn hàng đã được thanh toán", 400);
    }

    await markPaymentCancel(orderId);
    return successResponse(res, "Đã hủy thanh toán", { orderId });
  } catch (error) {
    return next(error);
  }
};

const markPaymentSuccess = async (orderId) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return null;
    }

    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID" }
    });

    await tx.payment.upsert({
      where: { orderId },
      update: {
        transactionId: `MOCK_TX_${Date.now()}`,
        amount: order.totalAmount,
        status: "PAID"
      },
      create: {
        orderId,
        provider: "MOCK_STRIPE",
        transactionId: `MOCK_TX_${Date.now()}`,
        amount: order.totalAmount,
        status: "PAID"
      }
    });

    return order;
  });
};

const markPaymentCancel = async (orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return null;
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "FAILED" }
    }),
    prisma.payment.upsert({
      where: { orderId },
      update: {
        amount: order.totalAmount,
        status: "CANCELLED"
      },
      create: {
        orderId,
        provider: "MOCK_STRIPE",
        amount: order.totalAmount,
        status: "CANCELLED"
      }
    })
  ]);

  return order;
};

const handleMockPaymentGateway = async (req, res, next) => {
  try {
    const { orderId, action = "success" } = req.query;
    if (!orderId) {
      return errorResponse(res, "orderId la bat buoc", 400);
    }

    const apiBaseUrl = getApiBaseUrl(req);
    if (action === "cancel") {
      return res.redirect(`${apiBaseUrl}/api/payments/cancel?orderId=${orderId}`);
    }

    return res.redirect(`${apiBaseUrl}/api/payments/success?orderId=${orderId}`);
  } catch (error) {
    return next(error);
  }
};

const handlePaymentSuccess = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return errorResponse(res, "orderId la bat buoc", 400);
    }

    const order = await markPaymentSuccess(orderId);
    if (!order) {
      return errorResponse(res, "Khong tim thay don hang", 404);
    }

    if (req.accepts("html")) {
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment-success?orderId=${orderId}`);
    }

    return successResponse(res, "Thanh toan thanh cong", { orderId });
  } catch (error) {
    return next(error);
  }
};

const handlePaymentCancel = async (req, res, next) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return errorResponse(res, "orderId la bat buoc", 400);
    }

    const order = await markPaymentCancel(orderId);
    if (!order) {
      return errorResponse(res, "Khong tim thay don hang", 404);
    }

    if (req.accepts("html")) {
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment-cancel?orderId=${orderId}`);
    }

    return successResponse(res, "Da huy thanh toan", { orderId });
  } catch (error) {
    return next(error);
  }
};

const stripeWebhook = async (req, res) => {
  return res.status(200).json({ received: true });
};

module.exports = {
  createCheckoutSession,
  confirmPayment,
  cancelPayment,
  handleMockPaymentGateway,
  handlePaymentSuccess,
  handlePaymentCancel,
  stripeWebhook
};
