const { ipKeyGenerator, rateLimit } = require("express-rate-limit");

// Gioi han so lan goi cac endpoint nhay cam (dang nhap, quen/dat lai mat khau)
// de chong do mat khau / spam (brute-force).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phut
  max: 10, // toi da 10 request cho moi email + IP + endpoint trong moi cua so
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : "";
    const routeKey = req.baseUrl && req.path ? `${req.baseUrl}${req.path}` : req.originalUrl;
    const ipKey = ipKeyGenerator(req.ip);

    return email ? `${routeKey}:${email}:${ipKey}` : `${routeKey}:${ipKey}`;
  },
  // Tat rate-limit khi chay test/dev neu can (mac dinh van bat).
  skip: () => process.env.DISABLE_RATE_LIMIT === "true",
  handler: (req, res) =>
    res.status(429).json({
      success: false,
      message: "Tai khoan hoac thao tac nay da thu qua nhieu lan. Vui long thu lai sau 15 phut."
    })
});

module.exports = { authLimiter };
