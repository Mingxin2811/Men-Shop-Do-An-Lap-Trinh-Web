require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const slugify = require("../src/utils/slugify");

const prisma = new PrismaClient();

const categories = [
  { name: "Áo thun", description: "Áo thun nam trẻ trung, dễ phối đồ." },
  { name: "Áo sơ mi", description: "Sơ mi nam lịch sự cho công sở và đi chơi." },
  { name: "Áo khoác", description: "Áo khoác nam phong cách hiện đại." },
  { name: "Quần jeans", description: "Quần jeans nam bền đẹp, năng động." },
  { name: "Quần tây", description: "Quần tây và chinos cho phong cách thanh lịch." },
  { name: "Phụ kiện", description: "Phụ kiện thời trang nam cần thiết." }
];

const products = [
  ["Áo thun basic cotton", "Áo thun cotton form regular, mềm và thoáng.", 199000, "Áo thun", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900"],
  ["Áo thun oversized", "Áo thun oversized phong cách streetwear.", 249000, "Áo thun", "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900"],
  ["Áo thun premium modal", "Áo thun modal mềm mịn, ít nhăn và thoáng khi mặc hằng ngày.", 289000, "Áo thun", "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=900"],
  ["Áo polo pique", "Áo polo vải pique đứng form, phù hợp đi làm và đi chơi.", 329000, "Áo thun", "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900"],
  ["Áo sơ mi oxford", "Sơ mi oxford dày dặn, phù hợp công sở.", 399000, "Áo sơ mi", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900"],
  ["Áo sơ mi linen", "Sơ mi linen nhẹ, thoáng mát cho mùa hè.", 429000, "Áo sơ mi", "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900"],
  ["Áo sơ mi kẻ caro", "Sơ mi caro trẻ trung, dễ mặc riêng hoặc khoác ngoài áo thun.", 389000, "Áo sơ mi", "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900"],
  ["Áo sơ mi denim", "Sơ mi denim nam chất vải bền, phong cách casual mạnh mẽ.", 459000, "Áo sơ mi", "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=900"],
  ["Áo khoác bomber", "Bomber jacket trẻ trung, giữ ấm vừa phải.", 699000, "Áo khoác", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900"],
  ["Áo khoác denim", "Áo khoác denim nam phong cách, bền bỉ.", 749000, "Áo khoác", "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900"],
  ["Áo khoác dù gió", "Áo khoác dù gió nhẹ, chắn gió và dễ gấp gọn khi di chuyển.", 599000, "Áo khoác", "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900"],
  ["Quần jeans slim fit", "Quần jeans slim fit tôn dáng, dễ phối giày.", 549000, "Quần jeans", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900"],
  ["Quần jeans straight fit", "Quần jeans ống đứng cổ điển, thoải mái.", 579000, "Quần jeans", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900"],
  ["Quần jeans relaxed fit", "Quần jeans relaxed fit rộng vừa, thoải mái cho ngày năng động.", 599000, "Quần jeans", "https://images.unsplash.com/photo-1511196044526-5cb3bcb7071b?w=900"],
  ["Quần tây công sở", "Quần tây nam lịch sự, chất vải đứng form.", 499000, "Quần tây", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900"],
  ["Quần chinos nam", "Quần chinos linh hoạt cho công sở và cuối tuần.", 459000, "Quần tây", "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=900"],
  ["Quần short kaki", "Quần short kaki gọn gàng, phù hợp đi chơi và du lịch.", 359000, "Quần tây", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=900"],
  ["Thắt lưng da nam", "Thắt lưng da tông màu đen cổ điển.", 299000, "Phụ kiện", "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=900"],
  ["Ví da nam", "Ví da nam nhỏ gọn, nhiều ngăn tiện lợi.", 349000, "Phụ kiện", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900"],
  ["Nón baseball basic", "Nón baseball basic dễ phối với áo thun, jeans và sneaker.", 189000, "Phụ kiện", "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900"]
];

const variantSets = ["S", "M", "L"].flatMap((size, sizeIndex) =>
  ["Đen", "Trắng", "Xám"].map((color, colorIndex) => ({
    size,
    color,
    stock: 5 + sizeIndex + colorIndex
  }))
);

const normalizeColor = (color) => ({
  Den: "Đen",
  Trang: "Trắng",
  Xam: "Xám"
}[color] || color);

const totalVariantStock = variantSets.reduce((total, variant) => total + variant.stock, 0);

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
      update: category,
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
      update: {
        name,
        description,
        price,
        imageUrl,
        stock: totalVariantStock,
        categoryId: category.id
      },
      create: {
        name,
        slug: slugify(name),
        description,
        price,
        imageUrl,
        stock: totalVariantStock,
        categoryId: category.id
      }
    });

    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: product.id }
    });
    const unusedVariants = [...existingVariants];
    const retainedVariantIds = [];

    for (const variant of variantSets) {
      const existingIndex = unusedVariants.findIndex(existing =>
        existing.size === variant.size &&
        normalizeColor(existing.color) === variant.color
      );

      if (existingIndex >= 0) {
        const [existing] = unusedVariants.splice(existingIndex, 1);
        await prisma.productVariant.update({
          where: { id: existing.id },
          data: variant
        });
        retainedVariantIds.push(existing.id);
      } else {
        const created = await prisma.productVariant.create({
          data: {
            ...variant,
            productId: product.id
          }
        });
        retainedVariantIds.push(created.id);
      }
    }

    if (unusedVariants.length > 0) {
      await prisma.productVariant.deleteMany({
        where: {
          productId: product.id,
          id: { notIn: retainedVariantIds }
        }
      });
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
