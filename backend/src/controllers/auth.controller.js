const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/db");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/response");
const { sendMail, buildOtpEmail } = require("../utils/mailer");

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const hashValue = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const createOtp = () => String(crypto.randomInt(100000, 1000000));

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  avatar: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

const saveAndSendOtp = async ({ email, name, purpose }) => {
  const code = createOtp();
  await prisma.otpCode.upsert({
    where: { email_purpose: { email, purpose } },
    update: {
      codeHash: hashValue(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0
    },
    create: {
      email,
      purpose,
      codeHash: hashValue(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    }
  });

  const mail = buildOtpEmail({ name, code, purpose });
  try {
    const result = await sendMail({ to: email, ...mail });
    return {
      devOtp:
        result?.skipped &&
        process.env.NODE_ENV === "development" &&
        process.env.EMAIL_DEV_MODE === "true"
          ? code
          : undefined
    };
  } catch (error) {
    await prisma.otpCode.deleteMany({ where: { email, purpose } });
    throw new Error(`Không thể gửi email OTP: ${error.message}`);
  }
};

const verifyOtp = async ({ email, purpose, code }) => {
  const record = await prisma.otpCode.findUnique({
    where: { email_purpose: { email, purpose } }
  });

  if (!record) return { valid: false, message: "Bạn chưa yêu cầu mã OTP." };
  if (record.expiresAt <= new Date()) {
    await prisma.otpCode.delete({ where: { id: record.id } });
    return { valid: false, message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." };
  }
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    return { valid: false, message: "Bạn đã nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới." };
  }
  if (record.codeHash !== hashValue(code)) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } }
    });
    return { valid: false, message: "Mã OTP không chính xác." };
  }

  return { valid: true, record };
};

const requestRegistrationOtp = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return errorResponse(res, "Email đã được sử dụng.", 409);
    }

    const otpResult = await saveAndSendOtp({
      email: normalizedEmail,
      name: name.trim(),
      purpose: "REGISTER"
    });
    return successResponse(
      res,
      otpResult.devOtp
        ? "Đang ở chế độ phát triển: sử dụng mã OTP hiển thị bên dưới."
        : "Mã OTP đăng ký đã được gửi đến email.",
      otpResult.devOtp ? { devOtp: otpResult.devOtp } : null
    );
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return errorResponse(res, "Email đã được sử dụng.", 409);
    }

    const verification = await verifyOtp({
      email: normalizedEmail,
      purpose: "REGISTER",
      code: otp
    });
    if (!verification.valid) {
      return errorResponse(res, verification.message, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone?.trim() || null,
          role: "CUSTOMER"
        },
        select: userSelect
      });
      await tx.otpCode.delete({ where: { id: verification.record.id } });
      return createdUser;
    });

    return successResponse(res, "Đăng ký tài khoản thành công.", { user }, 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse(res, "Email hoặc mật khẩu không đúng.", 401);
    }
    if (!user.isActive) {
      return errorResponse(res, "Tài khoản đã bị khóa.", 403);
    }

    const token = generateToken(user);
    const { password: _password, ...safeUser } = user;
    return successResponse(res, "Đăng nhập thành công.", { token, user: safeUser });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) =>
  successResponse(res, "Lấy thông tin người dùng thành công.", { user: req.user });

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(address !== undefined ? { address: address || null } : {}),
        ...(avatar !== undefined ? { avatar: avatar || null } : {})
      },
      select: userSelect
    });
    return successResponse(res, "Cập nhật hồ sơ thành công.", { user });
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return errorResponse(res, "Không tìm thấy người dùng.", 404);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return errorResponse(res, "Mật khẩu hiện tại không đúng.", 400);
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      return errorResponse(res, "Mật khẩu mới phải khác mật khẩu hiện tại.", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) }
    });
    return successResponse(res, "Đổi mật khẩu thành công.");
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, "Email chưa được đăng ký.", 404);
    if (!user.isActive) return errorResponse(res, "Tài khoản đang bị khóa.", 403);

    const otpResult = await saveAndSendOtp({
      email,
      name: user.name,
      purpose: "RESET_PASSWORD"
    });
    return successResponse(
      res,
      otpResult.devOtp
        ? "Đang ở chế độ phát triển: sử dụng mã OTP hiển thị bên dưới."
        : "Mã OTP đặt lại mật khẩu đã được gửi đến email.",
      otpResult.devOtp ? { devOtp: otpResult.devOtp } : null
    );
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return errorResponse(res, "Email chưa được đăng ký.", 404);

    const verification = await verifyOtp({
      email: normalizedEmail,
      purpose: "RESET_PASSWORD",
      code: otp
    });
    if (!verification.valid) {
      return errorResponse(res, verification.message, 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
      }),
      prisma.otpCode.delete({ where: { id: verification.record.id } })
    ]);

    return successResponse(res, "Đặt lại mật khẩu thành công.");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestRegistrationOtp,
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
