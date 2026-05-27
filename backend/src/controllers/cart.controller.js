import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
        product_variant: true
      }
    });

    // Tính subtotal cho từng dòng và total cho toàn bộ giỏ hàng
    const formattedCart = cartItems.map(item => {
      const price = item.product.price;
      return {
        ...item,
        subtotal: Number(price) * item.quantity
      };
    });

    const total = formattedCart.reduce((acc, item) => acc + item.subtotal, 0);

    return res.status(200).json({
      success: true,
      message: "Lấy giỏ hàng thành công",
      data: {
        items: formattedCart,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, variantId, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Số lượng phải lớn hơn 0" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại hoặc đã bị ẩn" });
    }

    // Kiểm tra tồn kho của biến thể hoặc sản phẩm chính
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.stock < quantity) {
        return res.status(400).json({ success: false, message: "Số lượng trong kho không đủ (Biến thể)" });
      }
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: "Số lượng trong kho không đủ" });
      }
    }

    // Kiểm tra xem mặt hàng đã nằm trong giỏ chưa
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId: variantId || null }
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { userId, productId, variantId: variantId || null, quantity }
      });
    }

    return res.status(200).json({ success: true, message: "Đã thêm sản phẩm vào giỏ hàng", data: cartItem });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Số lượng không hợp lệ" });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true, product_variant: true }
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền chỉnh sửa sản phẩm này" });
    }

    // Kiểm tra kho khi cập nhật số lượng mới
    if (cartItem.variantId) {
      if (cartItem.product_variant.stock < quantity) {
        return res.status(400).json({ success: false, message: "Kho không đủ hàng" });
      }
    } else {
      if (cartItem.product.stock < quantity) {
        return res.status(400).json({ success: false, message: "Kho không đủ hàng" });
      }
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    return res.status(200).json({ success: true, message: "Cập nhật số lượng thành công", data: updatedItem });
  } catch (error) {
    next(error);
  }
};

export const deleteCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== userId) {
      return res.status(403).json({ success: false, message: "Không tìm thấy sản phẩm hợp lệ trong giỏ" });
    }

    await prisma.cartItem.delete({ where: { id } });
    return res.status(200).json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await prisma.cartItem.deleteMany({ where: { userId } });
    return res.status(200).json({ success: true, message: "Làm trống giỏ hàng thành công" });
  } catch (error) {
    next(error);
  }
};