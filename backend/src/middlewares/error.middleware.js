const { errorResponse } = require("../utils/response");

const notFound = (req, res) => {
  return errorResponse(res, `Khong tim thay route ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const message = process.env.NODE_ENV === "production" ? "Loi server" : err.message;

  return errorResponse(res, message, statusCode);
};

module.exports = {
  notFound,
  errorHandler
};
