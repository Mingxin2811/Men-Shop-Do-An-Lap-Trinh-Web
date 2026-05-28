const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
        variant: true
      },
      orderBy: { createdAt: "desc" }
    });

    const items = cartItems.map((item) => ({
      ...item,
      subtotal: Number(item.product.price) * item.quantity
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return successResponse(res, "Lay gio hang thanh cong", { items, total });
  } catch (error) {
    return next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, variantId, quantity } = req.body;
    const addQuantity = Number(quantity);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return errorResponse(res, "San pham khong ton tai hoac da bi an", 404);
    }

    let variant = null;
    if (variantId) {
      variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.productId !== productId) {
        return errorResponse(res, "Bien the khong hop le voi san pham", 400);
      }
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId: variantId || null }
    });

    const nextQuantity = (existingItem?.quantity || 0) + addQuantity;
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock < nextQuantity) {
      return errorResponse(res, "So luong trong kho khong du", 400);
    }

    const cartItem = existingItem
      ? await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: nextQuantity },
          include: { product: true, variant: true }
        })
      : await prisma.cartItem.create({
          data: { userId, productId, variantId: variantId || null, quantity: addQuantity },
          include: { product: true, variant: true }
        });

    return successResponse(res, "Da them san pham vao gio hang", cartItem, 201);
  } catch (error) {
    return next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const quantity = Number(req.body.quantity);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true, variant: true }
    });

    if (!cartItem || cartItem.userId !== userId) {
      return errorResponse(res, "Khong tim thay san pham hop le trong gio", 404);
    }

    const availableStock = cartItem.variant ? cartItem.variant.stock : cartItem.product.stock;
    if (availableStock < quantity) {
      return errorResponse(res, "Kho khong du hang", 400);
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: true, variant: true }
    });

    return successResponse(res, "Cap nhat so luong thanh cong", updatedItem);
  } catch (error) {
    return next(error);
  }
};

const deleteCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({ where: { id } });
    if (!cartItem || cartItem.userId !== userId) {
      return errorResponse(res, "Khong tim thay san pham hop le trong gio", 404);
    }

    await prisma.cartItem.delete({ where: { id } });
    return successResponse(res, "Da xoa san pham khoi gio hang");
  } catch (error) {
    return next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    return successResponse(res, "Lam trong gio hang thanh cong");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
};
