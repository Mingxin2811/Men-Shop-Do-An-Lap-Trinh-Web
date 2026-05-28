const express = require("express");
const { body } = require("express-validator");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/category.controller");
const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

router.get("/", getCategories);
router.post(
  "/",
  protect,
  adminOnly,
  [body("name").trim().notEmpty().withMessage("Ten danh muc la bat buoc")],
  validate,
  createCategory
);
router.put(
  "/:id",
  protect,
  adminOnly,
  [body("name").optional().trim().notEmpty().withMessage("Ten danh muc khong duoc de trong")],
  validate,
  updateCategory
);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
