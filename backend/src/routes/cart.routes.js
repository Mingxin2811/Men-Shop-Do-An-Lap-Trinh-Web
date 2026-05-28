const express = require("express");
const { body } = require("express-validator");
const {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} = require("../controllers/cart.controller");
const protect = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post(
  "/",
  [
    body("productId").notEmpty().withMessage("San pham la bat buoc"),
    body("quantity").isInt({ min: 1 }).withMessage("So luong phai lon hon 0")
  ],
  validate,
  addToCart
);
router.put(
  "/:id",
  [body("quantity").isInt({ min: 1 }).withMessage("So luong phai lon hon 0")],
  validate,
  updateCartItem
);
router.delete("/:id", deleteCartItem);
router.delete("/", clearCart);

module.exports = router;
