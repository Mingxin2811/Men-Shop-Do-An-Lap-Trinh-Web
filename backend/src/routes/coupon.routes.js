const express = require("express");
const { body } = require("express-validator");
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require("../controllers/coupon.controller");
const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

// [Customer] Kiem tra ma giam gia voi gio hang hien tai.
router.post(
  "/validate",
  protect,
  [body("code").trim().notEmpty().withMessage("Vui long nhap ma giam gia")],
  validate,
  validateCoupon
);

// [Admin] Quan ly ma giam gia.
const couponValidators = [
  body("code").trim().notEmpty().withMessage("Ma giam gia la bat buoc"),
  body("discountType")
    .optional()
    .isIn(["PERCENT", "FIXED"])
    .withMessage("Loai giam gia khong hop le"),
  body("discountValue")
    .isFloat({ gt: 0 })
    .withMessage("Gia tri giam phai lon hon 0")
];

router.get("/", protect, adminOnly, getCoupons);
router.post("/", protect, adminOnly, couponValidators, validate, createCoupon);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

module.exports = router;
