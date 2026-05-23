const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateProfile
} = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Dang ky tai khoan khach hang
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: a@example.com
 *               password:
 *                 type: string
 *                 example: "12345678"
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *     responses:
 *       201:
 *         description: Dang ky thanh cong
 *       409:
 *         description: Email da duoc su dung
 *       422:
 *         description: Du lieu khong hop le
 */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Ten la bat buoc"),
    body("email").isEmail().withMessage("Email khong hop le"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Mat khau phai co it nhat 8 ky tu"),
    body("phone").optional({ checkFalsy: true }).isMobilePhone("vi-VN").withMessage("So dien thoai khong hop le")
  ],
  validate,
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Dang nhap
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: customer@menshop.com
 *               password:
 *                 type: string
 *                 example: Customer123456
 *     responses:
 *       200:
 *         description: Dang nhap thanh cong, tra ve JWT va user
 *       401:
 *         description: Email hoac mat khau khong dung
 *       403:
 *         description: Tai khoan da bi khoa
 *       422:
 *         description: Du lieu khong hop le
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email khong hop le"),
    body("password").notEmpty().withMessage("Mat khau la bat buoc")
  ],
  validate,
  login
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lay thong tin user hien tai
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lay thong tin thanh cong
 *       401:
 *         description: Token khong hop le hoac chua dang nhap
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Cap nhat ho so user hien tai
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *               address:
 *                 type: string
 *                 example: 123 Nguyen Trai, Quan 1, TP HCM
 *     responses:
 *       200:
 *         description: Cap nhat ho so thanh cong
 *       401:
 *         description: Token khong hop le hoac chua dang nhap
 *       422:
 *         description: Du lieu khong hop le
 */
router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("Ten khong duoc de trong"),
    body("phone").optional({ checkFalsy: true }).isMobilePhone("vi-VN").withMessage("So dien thoai khong hop le"),
    body("address").optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage("Dia chi toi da 255 ky tu")
  ],
  validate,
  updateProfile
);

module.exports = router;
