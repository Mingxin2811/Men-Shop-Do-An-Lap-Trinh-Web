const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array();
  return errorResponse(
    res,
    details[0]?.msg || "Dữ liệu không hợp lệ.",
    422,
    details
  );
};

module.exports = validate;
