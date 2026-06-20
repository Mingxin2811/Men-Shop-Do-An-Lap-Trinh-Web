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
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

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

const toSafeUser = (user) => {
  const {
    password: _password,
    resetToken: _resetToken,
    resetTokenExpiry: _resetTokenExpiry,
    googleId: _googleId,
    ...safeUser
  } = user;
  return safeUser;
};

const getFirstUrl = (value, fallback) =>
  (value || fallback)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)[0];

const getApiUrl = (req) =>
  getFirstUrl(process.env.API_URL, `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");

const getClientUrl = () => getFirstUrl(process.env.CLIENT_URL, "http://localhost:5173").replace(/\/$/, "");

const getGoogleCallbackUrl = (req) =>
  process.env.GOOGLE_CALLBACK_URL || `${getApiUrl(req)}/api/auth/google/callback`;

const ensureGoogleConfig = (req) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    const error = new Error("Google Login chua duoc cau hinh. Thieu GOOGLE_CLIENT_ID hoac GOOGLE_CLIENT_SECRET.");
    error.statusCode = 500;
    throw error;
  }
  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackUrl: getGoogleCallbackUrl(req)
  };
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
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return errorResponse(res, "Email hoặc mật khẩu không đúng.", 401);
    }
    if (!user.isActive) {
      return errorResponse(res, "Tài khoản đã bị khóa.", 403);
    }

    const token = generateToken(user);
    return successResponse(res, "Đăng nhập thành công.", { token, user: toSafeUser(user) });
  } catch (error) {
    return next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { clientId, callbackUrl } = ensureGoogleConfig(req);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account"
    });

    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  } catch (error) {
    return next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${getClientUrl()}/login?googleError=missing_code`);
    }

    const { clientId, clientSecret, callbackUrl } = ensureGoogleConfig(req);
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code"
      })
    });

    if (!tokenResponse.ok) {
      throw new Error("Khong the xac thuc voi Google.");
    }

    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (!profileResponse.ok) {
      throw new Error("Khong the lay thong tin tai khoan Google.");
    }

    const profile = await profileResponse.json();
    if (!profile.email || profile.email_verified === false) {
      return res.redirect(`${getClientUrl()}/login?googleError=email_not_verified`);
    }

    const email = profile.email.toLowerCase().trim();
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: profile.sub },
          { email }
        ]
      }
    });

    if (user) {
      if (!user.isActive) {
        return res.redirect(`${getClientUrl()}/login?googleError=blocked`);
      }
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.sub,
            authProvider: user.password ? "LOCAL_GOOGLE" : "GOOGLE",
            avatar: user.avatar || profile.picture || null
          }
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: profile.name || email.split("@")[0],
          email,
          password: null,
          avatar: profile.picture || null,
          googleId: profile.sub,
          authProvider: "GOOGLE",
          role: "CUSTOMER"
        }
      });
    }

    const token = generateToken(user);
    return res.redirect(`${getClientUrl()}/auth/google/callback?token=${encodeURIComponent(token)}`);
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
    if (!user.password) {
      return errorResponse(res, "Tai khoan Google chua co mat khau cuc bo. Vui long dung quen mat khau de tao mat khau.", 400);
    }
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
  googleLogin,
  googleCallback,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
