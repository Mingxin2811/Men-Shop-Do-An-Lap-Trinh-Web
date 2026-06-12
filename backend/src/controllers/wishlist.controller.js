const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// GET /api/wishlist - danh sach san pham yeu thich cua user
const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: { include: { category: true, variants: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Chi tra san pham con hien thi.
    const products = items.map((item) => item.product).filter((p) => p && p.isActive);

    return successResponse(res, "Lay danh sach yeu thich thanh cong", products);
  } catch (error) {
    return next(error);
  }
};

// POST /api/wishlist { productId } - them vao yeu thich (idempotent)
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return errorResponse(res, "Thieu productId", 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return errorResponse(res, "San pham khong ton tai", 404);
    }

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: {},
      create: { userId: req.user.id, productId }
    });

    return successResponse(res, "Da them vao danh sach yeu thich", null, 201);
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/wishlist/:productId - bo mot san pham khoi yeu thich
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id, productId }
    });
    return successResponse(res, "Da bo khoi danh sach yeu thich");
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/wishlist - xoa toan bo yeu thich
const clearWishlist = async (req, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({ where: { userId: req.user.id } });
    return successResponse(res, "Da xoa danh sach yeu thich");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};
