const express = require("express");
const { body } = require("express-validator");
const {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");
const {
  getProductReviews,
  upsertReview,
  deleteMyReview
} = require("../controllers/review.controller");
const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

const productValidation = [
  body("categoryId").notEmpty().withMessage("Danh muc la bat buoc"),
  body("name").trim().notEmpty().withMessage("Ten san pham la bat buoc"),
  body("price").isFloat({ gt: 0 }).withMessage("Gia phai lon hon 0"),
  body("stock").isInt({ min: 0 }).withMessage("Ton kho phai >= 0"),
  body("variants").optional().isArray().withMessage("variants phai la mang")
];

const updateProductValidation = [
  body("name").optional().trim().notEmpty().withMessage("Ten san pham khong duoc de trong"),
  body("price").optional().isFloat({ gt: 0 }).withMessage("Gia phai lon hon 0"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Ton kho phai >= 0"),
  body("isActive").optional().isBoolean().withMessage("isActive phai la boolean"),
  body("variants").optional().isArray().withMessage("variants phai la mang")
];

router.get("/", getProducts);
router.get("/admin/all", protect, adminOnly, getAdminProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, productValidation, validate, createProduct);
router.put("/:id", protect, adminOnly, updateProductValidation, validate, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Danh gia san pham
router.get("/:id/reviews", getProductReviews);
router.post(
  "/:id/reviews",
  protect,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Diem danh gia phai tu 1 den 5"),
    body("comment").optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage("Nhan xet toi da 1000 ky tu")
  ],
  validate,
  upsertReview
);
router.delete("/:id/reviews", protect, deleteMyReview);

module.exports = router;
