const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// Tinh thong ke danh gia: trung binh, tong so, phan bo theo sao.
const buildStats = (reviews) => {
  const totalReviews = reviews.length;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    sum += r.rating;
    if (distribution[r.rating] !== undefined) distribution[r.rating] += 1;
  }
  const averageRating = totalReviews ? Math.round((sum / totalReviews) * 10) / 10 : 0;
  return { averageRating, totalReviews, distribution };
};

const getReviewEligibility = async (userId, productId) => {
  const [purchasedOrderItem, existingReview] = await Promise.all([
    prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { not: "CANCELLED" }
        }
      },
      select: {
        id: true,
        order: { select: { status: true, paymentStatus: true } }
      }
    }),
    prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
      select: { id: true }
    })
  ]);

  return {
    canReview: Boolean(purchasedOrderItem || existingReview),
    hasPurchased: Boolean(purchasedOrderItem),
    hasCompletedPurchase: purchasedOrderItem?.order?.status === "COMPLETED",
    hasReview: Boolean(existingReview)
  };
};

// GET /api/products/:id/reviews - danh sach danh gia + thong ke (cong khai)
const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" }
    });

    return successResponse(res, "Lay danh gia thanh cong", {
      reviews,
      ...buildStats(reviews)
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/products/:id/reviews - tao hoac cap nhat danh gia cua user
const upsertReview = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;
    const rating = parseInt(req.body.rating, 10);
    const comment = (req.body.comment || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return errorResponse(res, "Diem danh gia phai tu 1 den 5 sao", 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return errorResponse(res, "San pham khong ton tai", 404);
    }

    const eligibility = await getReviewEligibility(userId, productId);
    if (!eligibility.canReview) {
      return errorResponse(
        res,
        "Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua sản phẩm này.",
        403
      );
    }

    const review = await prisma.review.upsert({
      where: { productId_userId: { productId, userId } },
      update: { rating, comment: comment || null },
      create: { productId, userId, rating, comment: comment || null },
      include: { user: { select: { id: true, name: true } } }
    });

    return successResponse(res, "Gui danh gia thanh cong", review, 201);
  } catch (error) {
    return next(error);
  }
};

const getMyReviewEligibility = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    });
    if (!product) return errorResponse(res, "Sản phẩm không tồn tại", 404);

    const eligibility = await getReviewEligibility(req.user.id, productId);
    return successResponse(res, "Lấy quyền đánh giá thành công", eligibility);
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/products/:id/reviews - xoa danh gia cua chinh user
const deleteMyReview = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    await prisma.review.deleteMany({
      where: { productId, userId: req.user.id }
    });
    return successResponse(res, "Da xoa danh gia");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProductReviews,
  getMyReviewEligibility,
  upsertReview,
  deleteMyReview
};
