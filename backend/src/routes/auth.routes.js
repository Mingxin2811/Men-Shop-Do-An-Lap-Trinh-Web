const express = require("express");
const { body } = require("express-validator");
const {
  requestRegistrationOtp,
  register,
  login,
  googleLogin,
  googleCallback,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

const router = express.Router();
const strongPassword = (field, label = "Mật khẩu") =>
  body(field)
    .isLength({ min: 8 })
    .withMessage(`${label} phải có ít nhất 8 ký tự`)
    .matches(/[A-Za-z]/)
    .withMessage(`${label} phải có ít nhất một chữ cái`)
    .matches(/\d/)
    .withMessage(`${label} phải có ít nhất một chữ số`);

router.post(
  "/register/request-otp",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Tên là bắt buộc"),
    body("email").isEmail().withMessage("Email không hợp lệ"),
    strongPassword("password"),
    body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage("Số điện thoại tối đa 30 ký tự")
  ],
  validate,
  requestRegistrationOtp
);

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
    strongPassword("password"),
    body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage("Số điện thoại tối đa 30 ký tự"),
    body("otp").matches(/^\d{6}$/).withMessage("Mã OTP phải gồm 6 chữ số")
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
  authLimiter,
  [
    body("email").isEmail().withMessage("Email khong hop le"),
    body("password").notEmpty().withMessage("Mat khau la bat buoc")
  ],
  validate,
  login
);

router.get("/google", authLimiter, googleLogin);
router.get("/google/callback", googleCallback);

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
    body("phone").optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage("Số điện thoại tối đa 100 ký tự"),
    body("address").optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage("Dia chi toi da 255 ky tu"),
    body("avatar")
      .optional({ checkFalsy: true })
      .custom((value) => {
        const isPreset = /^preset:(cat|dog|fox|panda|bear|lion)$/.test(value);
        const isImage = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
        if (!isPreset && !isImage) throw new Error("Ảnh đại diện không hợp lệ");
        if (value.length > 1500000) throw new Error("Ảnh đại diện quá lớn");
        return true;
      })
  ],
  validate,
  updateProfile
);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Doi mat khau cho user hien tai
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doi mat khau thanh cong
 *       400:
 *         description: Mat khau hien tai khong dung
 *       422:
 *         description: Du lieu khong hop le
 */
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Mat khau hien tai la bat buoc"),
    strongPassword("newPassword", "Mật khẩu mới")
  ],
  validate,
  changePassword
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().withMessage("Email khong hop le")],
  validate,
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("otp").matches(/^\d{6}$/).withMessage("Mã OTP phải gồm 6 chữ số"),
    strongPassword("newPassword", "Mật khẩu mới")
  ],
  validate,
  resetPassword
);

module.exports = router;
