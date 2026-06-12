const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { errorResponse } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Vui long dang nhap", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
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
      }
    });

    if (!user || !user.isActive) {
      return errorResponse(res, "Tai khoan khong ton tai hoac da bi khoa", 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return errorResponse(res, "Token khong hop le hoac da het han", 401);
  }
};

module.exports = protect;
