const express = require("express");
const { body } = require("express-validator");
const {
  getPosts,
  getPostBySlug,
  getAdminPosts,
  createPost,
  updatePost,
  deletePost
} = require("../controllers/post.controller");
const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

const postValidation = [
  body("title").trim().notEmpty().withMessage("Tieu de la bat buoc"),
  body("content").trim().notEmpty().withMessage("Noi dung la bat buoc")
];

router.get("/", getPosts);
router.get("/admin/all", protect, adminOnly, getAdminPosts);
router.get("/:slug", getPostBySlug);
router.post("/", protect, adminOnly, postValidation, validate, createPost);
router.put("/:id", protect, adminOnly, updatePost);
router.delete("/:id", protect, adminOnly, deletePost);

module.exports = router;
