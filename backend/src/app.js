require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const postRoutes = require("./routes/post.routes");
const swaggerSpec = require("./config/swagger");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is running",
    data: {
      service: "mens-fashion-shop-backend"
    } 
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
