require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const slugify = require("../src/utils/slugify");

const prisma = new PrismaClient();

const categories = [
  { name: "Ao thun", description: "Ao thun nam tre trung, de phoi do." },
  { name: "Ao so mi", description: "So mi nam lich su cho cong so va di choi." },
  { name: "Ao khoac", description: "Ao khoac nam phong cach hien dai." },
  { name: "Quan jeans", description: "Quan jeans nam ben dep, nang dong." },
  { name: "Quan tay", description: "Quan tay va chinos cho phong cach thanh lich." },
  { name: "Phu kien", description: "Phu kien thoi trang nam can thiet." }
];

const products = [
  ["Ao thun basic cotton", "Ao thun cotton form regular, mem va thoang.", 199000, "Ao thun", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900"],
  ["Ao thun oversized", "Ao thun oversized phong cach streetwear.", 249000, "Ao thun", "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900"],
  ["Ao thun premium modal", "Ao thun modal mem min, it nhan va thoang khi mac hang ngay.", 289000, "Ao thun", "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=900"],
  ["Ao polo pique", "Ao polo vai pique dung form, phu hop di lam va di choi.", 329000, "Ao thun", "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900"],
  ["Ao so mi oxford", "So mi oxford day dan, phu hop cong so.", 399000, "Ao so mi", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900"],
  ["Ao so mi linen", "So mi linen nhe, thoang mat cho mua he.", 429000, "Ao so mi", "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900"],
  ["Ao so mi ke caro", "So mi caro tre trung, de mac rieng hoac khoac ngoai ao thun.", 389000, "Ao so mi", "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900"],
  ["Ao so mi denim", "So mi denim nam chat vai ben, phong cach casual manh me.", 459000, "Ao so mi", "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=900"],
  ["Ao khoac bomber", "Bomber jacket tre trung, giu am vua phai.", 699000, "Ao khoac", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900"],
  ["Ao khoac denim", "Ao khoac denim nam phong cach, ben bi.", 749000, "Ao khoac", "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900"],
  ["Ao khoac du gio", "Ao khoac du gio nhe, chan gio va de gap gon khi di chuyen.", 599000, "Ao khoac", "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900"],
  ["Quan jeans slim fit", "Quan jeans slim fit ton dang, de phoi giay.", 549000, "Quan jeans", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900"],
  ["Quan jeans straight fit", "Quan jeans ong dung co dien, thoai mai.", 579000, "Quan jeans", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900"],
  ["Quan jeans relaxed fit", "Quan jeans relaxed fit rong vua, thoai mai cho ngay nang dong.", 599000, "Quan jeans", "https://images.unsplash.com/photo-1511196044526-5cb3bcb7071b?w=900"],
  ["Quan tay cong so", "Quan tay nam lich su, chat vai dung form.", 499000, "Quan tay", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900"],
  ["Quan chinos nam", "Quan chinos linh hoat cho cong so va cuoi tuan.", 459000, "Quan tay", "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=900"],
  ["Quan short kaki", "Quan short kaki gon gang, phu hop di choi va du lich.", 359000, "Quan tay", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=900"],
  ["That lung da nam", "That lung da tong mau den co dien.", 299000, "Phu kien", "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=900"],
  ["Vi da nam", "Vi da nam nho gon, nhieu ngan tien loi.", 349000, "Phu kien", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900"],
  ["Non baseball basic", "Non baseball basic de phoi voi ao thun, jeans va sneaker.", 189000, "Phu kien", "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900"]
];

const variantSets = [
  { size: "S", color: "Den", stock: 15 },
  { size: "M", color: "Trang", stock: 20 },
  { size: "L", color: "Xam", stock: 18 }
];

async function main() {
  const adminPassword = await bcrypt.hash("Admin123456", 10);
  const customerPassword = await bcrypt.hash("Customer123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@menshop.com" },
    update: {},
    create: {
      name: "Admin Men Shop",
      email: "admin@menshop.com",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "customer@menshop.com" },
    update: {},
    create: {
      name: "Customer Demo",
      email: "customer@menshop.com",
      password: customerPassword,
      phone: "0901234567",
      role: "CUSTOMER"
    }
  });

  const categoryMap = new Map();

  for (const category of categories) {
    const savedCategory = await prisma.category.upsert({
      where: { slug: slugify(category.name) },
      update: {},
      create: {
        ...category,
        slug: slugify(category.name)
      }
    });

    categoryMap.set(category.name, savedCategory);
  }

  for (const [name, description, price, categoryName, imageUrl] of products) {
    const category = categoryMap.get(categoryName);

    const product = await prisma.product.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: {
        name,
        slug: slugify(name),
        description,
        price,
        imageUrl,
        stock: 53,
        categoryId: category.id
      }
    });

    for (const variant of variantSets) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          productId: product.id,
          size: variant.size,
          color: variant.color
        }
      });

      if (!existingVariant) {
        await prisma.productVariant.create({
          data: {
            ...variant,
            productId: product.id
          }
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed data created successfully.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
