// Cap quyen ADMIN cho mot tai khoan da dang ky.
// Dung khi database trong: dang ky tai khoan tren web roi chay script nay.
// Cach dung:
//   node prisma/make-admin.js <email>
//   (trong Docker) docker compose exec backend node prisma/make-admin.js <email>
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "").toLowerCase().trim();
  if (!email) {
    console.error("Thieu email. Cach dung: node prisma/make-admin.js <email>");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    console.error(`Khong tim thay tai khoan voi email: ${email}`);
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" }
  });
  console.log(`Da cap quyen ADMIN cho: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
