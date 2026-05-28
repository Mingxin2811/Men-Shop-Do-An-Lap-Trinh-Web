const express = require("express");
const { body } = require("express-validator");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/order.controller");
const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("shippingName").trim().notEmpty().withMessage("Ten nguoi nhan la bat buoc"),
    body("shippingPhone").trim().notEmpty().withMessage("So dien thoai la bat buoc"),
    body("shippingAddress").trim().notEmpty().withMessage("Dia chi giao hang la bat buoc"),
    body("paymentMethod").optional().isIn(["COD", "STRIPE"]).withMessage("Phuong thuc thanh toan khong hop le")
  ],
  validate,
  createOrder
);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
