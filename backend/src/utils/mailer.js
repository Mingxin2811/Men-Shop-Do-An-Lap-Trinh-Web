const nodemailer = require("nodemailer");

let transporter;
const SMTP_TIMEOUT_MS = Number(process.env.SMTP_TIMEOUT_MS) || 15000;

const normalizeSmtpPass = (value) => String(value || "").replace(/\s+/g, "");
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return null;
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
};

const getMailConfigStatus = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_DEV_MODE } = process.env;
  const normalizedPass = normalizeSmtpPass(SMTP_PASS);

  return {
    devMode: EMAIL_DEV_MODE === "true",
    exposeOtpInResponse: process.env.OTP_EXPOSE_IN_RESPONSE === "true",
    host: SMTP_HOST || null,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    user: maskEmail(SMTP_USER),
    hasUser: Boolean(SMTP_USER),
    hasPassword: Boolean(normalizedPass),
    passwordHadWhitespace: Boolean(SMTP_PASS && SMTP_PASS !== normalizedPass),
    readyForSmtp: Boolean(SMTP_HOST && SMTP_USER && normalizedPass),
    timeoutMs: SMTP_TIMEOUT_MS
  };
};

// Khoi tao transporter tu bien moi truong SMTP (neu co).
const getTransporter = () => {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  const smtpPass = normalizeSmtpPass(SMTP_PASS);
  if (SMTP_HOST && SMTP_USER && smtpPass) {
    const port = Number(SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: SMTP_SECURE === "true" || port === 465,
      requireTLS: port === 587,
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
      auth: { user: SMTP_USER, pass: smtpPass }
    });
  } else {
    transporter = null; // chua cau hinh SMTP
  }
  return transporter;
};

// Gui email. Neu chua cau hinh SMTP -> log ra console (che do dev), khong loi.
const sendMail = async ({ to, subject, html, text }) => {
  const senderName = process.env.MAIL_FROM || "Men's Shop";
  const from = process.env.SMTP_USER
    ? `${senderName} <${process.env.SMTP_USER}>`
    : senderName;

  if (process.env.EMAIL_DEV_MODE === "true") {
    console.log("------------ [EMAIL - DEV MODE] ------------");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", text || (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("--------------------------------------------");
    return { skipped: true };
  }

  const t = getTransporter();

  if (!t) {
    throw new Error(
      "SMTP chưa được cấu hình. Hãy điền SMTP_USER và SMTP_PASS trong backend/.env."
    );
  }

  return t.sendMail({ from, to, subject, html, text });
};

const verifyMailConnection = async () => {
  const t = getTransporter();
  if (!t) {
    throw new Error("Thiếu SMTP_USER hoặc SMTP_PASS trong backend/.env.");
  }
  await t.verify();
  return true;
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

// Tao noi dung email dat lai mat khau.
const buildPasswordResetEmail = (user, resetUrl) => {
  const subject = "Đặt lại mật khẩu - Men's Shop";
  const text =
    `Xin chao ${user.name},\n\n` +
    `Ban (hoac ai do) da yeu cau dat lai mat khau cho tai khoan Men's Shop.\n` +
    `Nhan vao lien ket sau de dat lai mat khau (het han sau 1 gio):\n${resetUrl}\n\n` +
    `Neu ban khong yeu cau, hay bo qua email nay.`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
    <h2 style="font-weight:500;">Đặt lại mật khẩu</h2>
    <p>Xin chào <strong>${user.name}</strong>,</p>
    <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản Men's Shop.</p>
    <p style="margin:24px 0;">
      <a href="${resetUrl}" style="background:#0a0a0a;color:#fff;padding:12px 28px;text-decoration:none;border-radius:4px;display:inline-block;">Đặt lại mật khẩu</a>
    </p>
    <p style="color:#888;font-size:13px;">Liên kết sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    <p style="color:#888;font-size:12px;word-break:break-all;">Hoặc dán liên kết: ${resetUrl}</p>
  </div>`;
  return { subject, text, html };
};

const buildOtpEmail = ({ name, code, purpose }) => {
  const isRegistration = purpose === "REGISTER";
  const action = isRegistration ? "đăng ký tài khoản" : "đặt lại mật khẩu";
  const subject = `Mã OTP ${action} - Men's Shop`;
  const text =
    `Xin chào ${name || "bạn"},\n\n` +
    `Mã OTP để ${action} là: ${code}\n` +
    "Mã có hiệu lực trong 10 phút và chỉ được sử dụng một lần.\n\n" +
    "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.";
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
    <h2 style="font-weight:500;">Xác thực ${action}</h2>
    <p>Xin chào <strong>${name || "bạn"}</strong>,</p>
    <p>Mã OTP của bạn là:</p>
    <div style="margin:24px 0;padding:18px;background:#f4f2ef;text-align:center;font-size:30px;font-weight:700;letter-spacing:10px;">
      ${code}
    </div>
    <p style="color:#666;">Mã có hiệu lực trong 10 phút và chỉ được sử dụng một lần.</p>
    <p style="color:#888;font-size:13px;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>
  </div>`;

  return { subject, text, html };
};

module.exports = {
  sendMail,
  buildOrderConfirmationEmail,
  buildPasswordResetEmail,
  buildOtpEmail,
  verifyMailConnection,
  getMailConfigStatus
};
