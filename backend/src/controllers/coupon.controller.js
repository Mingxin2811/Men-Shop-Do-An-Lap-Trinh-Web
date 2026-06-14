const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { getEffectivePrice } = require("../utils/price");
const { computeDiscount, getCouponError } = require("../utils/coupon");

const normalizeCode = (code) => String(code || "").trim().toUpperCase();

// Tinh tam tinh (subtotal) gio hang hien tai cua user.
const getCartSubtotal = async (userId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  return cartItems.reduce(
    (sum, item) => sum + getEffectivePrice(item.product) * item.quantity,
    0
  );
};

// [Customer] Kiem tra ma giam gia voi gio hang hien tai va tra ve so tien duoc giam.
const validateCoupon = async (req, res, next) => {
  try {
    const code = normalizeCode(req.body.code);
    if (!code) {
      return errorResponse(res, "Vui long nhap ma giam gia", 400);
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    const subtotal = await getCartSubtotal(req.user.id);

    if (subtotal <= 0) {
      return errorResponse(res, "Gio hang trong", 400);
    }

    const error = getCouponError(coupon, subtotal);
    if (error) {
      return errorResponse(res, error, 400);
    }

    const discountAmount = computeDiscount(coupon, subtotal);

    return successResponse(res, "Ap dung ma giam gia thanh cong", {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      subtotal,
      discountAmount,
      finalTotal: subtotal - discountAmount
    });
  } catch (error) {
    return next(error);
  }
};

// [Admin] Danh sach ma giam gia.
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });
    return successResponse(res, "Lay danh sach ma giam gia thanh cong", coupons);
  } catch (error) {
    return next(error);
  }
};

// [Admin] Tao ma giam gia.
const createCoupon = async (req, res, next) => {
  try {
    const code = normalizeCode(req.body.code);
    const {
      description,
      discountType = "PERCENT",
      discountValue,
      minOrderValue = 0,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive = true
    } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return errorResponse(res, "Ma giam gia da ton tai", 409);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: description?.trim() || null,
        discountType,
        discountValue,
        minOrderValue,
        maxDiscount: maxDiscount === "" || maxDiscount == null ? null : maxDiscount,
        usageLimit: usageLimit === "" || usageLimit == null ? null : parseInt(usageLimit, 10),
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive
      }
    });

    return successResponse(res, "Tao ma giam gia thanh cong", coupon, 201);
  } catch (error) {
    return next(error);
  }
};

// [Admin] Cap nhat ma giam gia.
const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Khong tim thay ma giam gia", 404);
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      isActive
    } = req.body;

    // Khong cho trung code voi ma khac.
    if (code !== undefined) {
      const newCode = normalizeCode(code);
      const dup = await prisma.coupon.findUnique({ where: { code: newCode } });
      if (dup && dup.id !== id) {
        return errorResponse(res, "Ma giam gia da ton tai", 409);
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code !== undefined ? { code: normalizeCode(code) } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(discountType !== undefined ? { discountType } : {}),
        ...(discountValue !== undefined ? { discountValue } : {}),
        ...(minOrderValue !== undefined ? { minOrderValue } : {}),
        ...(maxDiscount !== undefined
          ? { maxDiscount: maxDiscount === "" || maxDiscount == null ? null : maxDiscount }
          : {}),
        ...(usageLimit !== undefined
          ? { usageLimit: usageLimit === "" || usageLimit == null ? null : parseInt(usageLimit, 10) }
          : {}),
        ...(startsAt !== undefined ? { startsAt: startsAt ? new Date(startsAt) : null } : {}),
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        ...(isActive !== undefined ? { isActive } : {})
      }
    });

    return successResponse(res, "Cap nhat ma giam gia thanh cong", coupon);
  } catch (error) {
    return next(error);
  }
};

// [Admin] Xoa ma giam gia.
const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Khong tim thay ma giam gia", 404);
    }

    await prisma.coupon.delete({ where: { id } });
    return successResponse(res, "Xoa ma giam gia thanh cong");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
