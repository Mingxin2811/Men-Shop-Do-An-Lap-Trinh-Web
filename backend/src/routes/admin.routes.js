const express = require("express");
const { body } = require("express-validator");
const {
  getDashboardStats,
  getMailStatus,
  getUsers,
  getUserOrders,
  updateUserStatus
} = require("../controllers/admin.controller");
const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/mail-status", getMailStatus);
router.get("/users", getUsers);
router.get("/users/:id/orders", getUserOrders);
router.put(
  "/users/:id/status",
  [body("isActive").isBoolean().withMessage("isActive phai la boolean")],
  validate,
  updateUserStatus
);

module.exports = router;
