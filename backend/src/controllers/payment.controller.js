import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng hợp lệ" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, message: "Đơn hàng này đã thanh toán rồi" });
    }

    // Giả lập môi trường Test Sandbox (Đảm bảo đồ án chạy mượt mà không bị lỗi Token Stripe/VNPay)
    // Cung cấp URL xử lý trực tiếp để sinh viên dễ dàng demo khi bảo vệ đồ án trước hội đồng
    const mockCheckoutUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/api/payments/mock-gateway?orderId=${orderId}`;

    return res.status(200).json({
      success: true,
      message: "Tạo phiên thanh toán giả lập thành công",
      checkoutUrl: mockCheckoutUrl
    });
  } catch (error) {
    next(error);
  }
};

export const handleMockPaymentGateway = async (req, res, next) => {
  try {
    const { orderId, action } = req.query; // action có thể là 'success' hoặc 'cancel'

    if (action === 'cancel') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED", status: "PENDING" }
      });
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancel`);
    }

    // Trường hợp mặc định hoặc chọn thanh toán thành công thành công (Success)
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: "PAID" }
      });

      await tx.payment.create({
        data: {
          orderId,
          provider: "STRIPE_SANDBOX",
          transactionId: "MOCK_TX_" + Date.now(),
          amount: (await tx.order.findUnique({ where: { id: orderId } })).totalAmount,
          status: "PAID"
        }
      });
    });

    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success`);
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (req, res) => {
  // Điểm neo nhận phản hồi sự kiện từ Webhook thực tế
  return res.status(200).json({ received: true });
};