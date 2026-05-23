const { errorResponse } = require("../utils/response");

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return errorResponse(res, "Ban khong co quyen thuc hien thao tac nay", 403);
  }

  return next();
};

module.exports = adminOnly;
