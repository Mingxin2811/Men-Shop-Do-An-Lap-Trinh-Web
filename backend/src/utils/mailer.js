const nodemailer = require("nodemailer");

let transporter;

// Khoi tao transporter tu bien moi truong SMTP (neu co).
const getTransporter = () => {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  } else {
    transporter = null; // chua cau hinh SMTP
  }
  return transporter;
};

// Gui email. Neu chua cau hinh SMTP -> log ra console (che do dev), khong loi.
const sendMail = async ({ to, subject, html, text }) => {
  const from = process.env.MAIL_FROM || "Men's Shop <no-reply@menshop.vn>";
  const t = getTransporter();

  if (!t) {
    console.log("──────────── [EMAIL - DEV MODE] ────────────");
    console.log("SMTP chua cau hinh, chi log noi dung email:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", text || (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("─────────────────────────────────────────────");
    return { skipped: true };
  }

  return t.sendMail({ from, to, subject, html, text });
};

const formatVnd = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(n) || 0);

// Tao noi dung email xac nhan don hang.
const buildOrderConfirmationEmail = (order, user) => {
  const code = order.id.slice(-8).toUpperCase();
  const itemsText = (order.items || [])
    .map((i) => `- ${i.productName}${i.size ? ` (${i.size}${i.color ? ", " + i.color : ""})` : ""} x${i.quantity}: ${formatVnd(Number(i.price) * i.quantity)}`)
    .join("\n");
  const itemsHtml = (order.items || [])
    .map((i) => `<tr><td style="padding:6px 0;">${i.productName}${i.size ? ` <span style="color:#888;">(${i.size}${i.color ? ", " + i.color : ""})</span>` : ""}</td><td style="text-align:center;">x${i.quantity}</td><td style="text-align:right;">${formatVnd(Number(i.price) * i.quantity)}</td></tr>`)
    .join("");

  const subject = `Xác nhận đơn hàng #${code} - Men's Shop`;

  const text = `Cam on ${user.name} da dat hang tai Men's Shop!\n\n` +
    `Ma don hang: #${code}\n` +
    `Nguoi nhan: ${order.shippingName} - ${order.shippingPhone}\n` +
    `Dia chi: ${order.shippingAddress}\n` +
    `Phuong thuc thanh toan: ${order.paymentMethod}\n\n` +
    `San pham:\n${itemsText}\n\n` +
    `Tong cong: ${formatVnd(order.totalAmount)}\n\n` +
    `Chung toi se xu ly don hang som nhat. Cam on ban!`;

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
    <h2 style="font-weight:500;">Cảm ơn bạn đã đặt hàng!</h2>
    <p>Xin chào <strong>${user.name}</strong>, đơn hàng của bạn đã được tiếp nhận.</p>
    <p style="margin:4px 0;"><strong>Mã đơn hàng:</strong> #${code}</p>
    <p style="margin:4px 0;"><strong>Người nhận:</strong> ${order.shippingName} — ${order.shippingPhone}</p>
    <p style="margin:4px 0;"><strong>Địa chỉ:</strong> ${order.shippingAddress}</p>
    <p style="margin:4px 0;"><strong>Thanh toán:</strong> ${order.paymentMethod}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px;">
      <thead><tr style="border-bottom:1px solid #ddd;text-align:left;">
        <th style="padding-bottom:6px;">Sản phẩm</th><th style="text-align:center;">SL</th><th style="text-align:right;">Thành tiền</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p style="text-align:right;font-size:16px;margin-top:12px;"><strong>Tổng cộng: ${formatVnd(order.totalAmount)}</strong></p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
    <p style="color:#888;font-size:13px;">Men's Shop sẽ xử lý đơn hàng của bạn sớm nhất. Cảm ơn bạn đã tin tưởng!</p>
  </div>`;

  return { subject, text, html };
};

module.exports = { sendMail, buildOrderConfirmationEmail };
