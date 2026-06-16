const rateLimit = require("express-rate-limit");

// Gioi han so lan goi cac endpoint nhay cam (dang nhap, quen/dat lai mat khau)
// de chong do mat khau / spam (brute-force).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phut
  max: 10, // toi da 10 request moi IP trong moi cua so
  standardHeaders: true,
  legacyHeaders: false,
  // Tat rate-limit khi chay test/dev neu can (mac dinh van bat).
  skip: () => process.env.DISABLE_RATE_LIMIT === "true",
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      message: "Ban da thu qua nhieu lan. Vui long thu lai sau 15 phut."
    })
});

module.exports = { authLimiter };
