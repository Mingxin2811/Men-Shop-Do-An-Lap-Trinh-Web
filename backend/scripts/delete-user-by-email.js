require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const email = (process.argv[2] || "").trim().toLowerCase();

if (!email || !email.includes("@")) {
  console.error("Usage: npm run user:delete -- user@example.com");
  process.exit(1);
}

const main = async () => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true }
  });

  const deletedOtp = await prisma.otpCode.deleteMany({ where: { email } });

  if (!user) {
    console.log(`Khong tim thay user ${email}. Da xoa ${deletedOtp.count} OTP neu co.`);
    return;
  }

  const orderIds = (
    await prisma.order.findMany({
      where: { userId: user.id },
      select: { id: true }
    })
  ).map((order) => order.id);

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { userId: user.id } }),
    prisma.wishlistItem.deleteMany({ where: { userId: user.id } }),
    prisma.review.deleteMany({ where: { userId: user.id } }),
    prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
    prisma.user.delete({ where: { id: user.id } })
  ]);

  console.log(`Da xoa user ${user.email} (${user.role}) va du lieu lien quan.`);
  console.log(`Da xoa ${deletedOtp.count} OTP cua email nay.`);
};

main()
  .catch((error) => {
    console.error(`Xoa user that bai: ${error.message}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
