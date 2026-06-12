require("dotenv").config();

const { verifyMailConnection } = require("../src/utils/mailer");

verifyMailConnection()
  .then(() => {
    console.log("Kết nối SMTP thành công.");
  })
  .catch((error) => {
    console.error(`Kết nối SMTP thất bại: ${error.message}`);
    process.exit(1);
  });
