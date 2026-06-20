require("dotenv").config();

const { sendMail } = require("../src/utils/mailer");

const to = process.argv[2] || process.env.MAIL_TEST_TO;

if (!to) {
  console.error("Hay truyen email nhan test: npm run mail:test -- your-email@gmail.com");
  process.exit(1);
}

sendMail({
  to,
  subject: "Test email - Men's Shop",
  text: "Neu ban nhan duoc email nay, cau hinh gui mail cua Men's Shop dang hoat dong.",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
      <h2>Test email - Men's Shop</h2>
      <p>Neu ban nhan duoc email nay, cau hinh gui mail cua Men's Shop dang hoat dong.</p>
    </div>
  `
})
  .then((result) => {
    console.log("Gui email test thanh cong.");
    if (result?.id) console.log(`Resend email id: ${result.id}`);
  })
  .catch((error) => {
    console.error(`Gui email test that bai: ${error.message}`);
    process.exit(1);
  });
