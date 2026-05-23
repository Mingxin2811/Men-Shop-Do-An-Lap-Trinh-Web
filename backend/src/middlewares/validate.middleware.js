const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return errorResponse(res, "Du lieu khong hop le", 422, errors.array());
};

module.exports = validate;
