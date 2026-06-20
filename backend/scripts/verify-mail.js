require("dotenv").config();

const { verifyMailConnection } = require("../src/utils/mailer");

verifyMailConnection()
  .then(() => {
    console.log("Cau hinh email hop le.");
  })
  .catch((error) => {
    console.error(`Cau hinh email chua hop le: ${error.message}`);
    process.exit(1);
  });
