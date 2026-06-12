const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/response");

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return errorResponse(res, "Email da duoc su dung", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
        role: "CUSTOMER"
      },
      select: userSelect
    });

    return successResponse(res, "Dang ky tai khoan thanh cong", { user }, 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return errorResponse(res, "Email hoac mat khau khong dung", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Email hoac mat khau khong dung", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "Tai khoan da bi khoa", 403);
    }

    const token = generateToken(user);
    const { password: _password, ...safeUser } = user;

    return successResponse(res, "Dang nhap thanh cong", {
      token,
      user: safeUser
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  return successResponse(res, "Lay thong tin nguoi dung thanh cong", {
    user: req.user
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(address !== undefined ? { address: address || null } : {})
      },
      select: userSelect
    });

    return successResponse(res, "Cap nhat ho so thanh cong", { user });
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return errorResponse(res, "Khong tim thay nguoi dung", 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Mat khau hien tai khong dung", 400);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return errorResponse(res, "Mat khau moi phai khac mat khau hien tai", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return successResponse(res, "Doi mat khau thanh cong");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
