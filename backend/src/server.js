const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Không thể khởi động backend: port ${PORT} đang được một tiến trình khác sử dụng.`
    );
    console.error(
      `Hãy dừng backend cũ trước khi chạy lại, hoặc đổi PORT trong backend/.env.`
    );
    process.exit(1);
  }

  console.error("Không thể khởi động backend:", error.message);
  process.exit(1);
});

const shutdown = (signal) => {
  console.log(`Nhận ${signal}, đang dừng backend...`);
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
