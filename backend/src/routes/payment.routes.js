const express = require("express");
const { body } = require("express-validator");
const {
  createCheckoutSession,
  handleMockPaymentGateway,
  handlePaymentSuccess,
  handlePaymentCancel,
  stripeWebhook
} = require("../controllers/payment.controller");
const protect = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.post(
  "/create-checkout-session",
  protect,
  [body("orderId").notEmpty().withMessage("orderId la bat buoc")],
  validate,
  createCheckoutSession
);
router.get("/mock-gateway", handleMockPaymentGateway);
router.get("/success", handlePaymentSuccess);
router.get("/cancel", handlePaymentCancel);
router.post("/webhook", stripeWebhook);

module.exports = router;
