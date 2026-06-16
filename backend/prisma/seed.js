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

// Cau truc: [ten, mo ta, gia, danh muc, anh, giaKhuyenMai?]
const products = [
  ["Áo thun basic cotton", "Áo thun cotton form regular, mềm và thoáng.", 199000, "Áo thun", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900"],
  ["Áo thun oversized", "Áo thun oversized phong cách streetwear.", 249000, "Áo thun", "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=900", 199000],
  ["Áo thun premium modal", "Áo thun modal mềm mịn, ít nhăn và thoáng khi mặc hằng ngày.", 289000, "Áo thun", "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=900"],
  ["Áo polo pique", "Áo polo vải pique đứng form, phù hợp đi làm và đi chơi.", 329000, "Áo thun", "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900", 279000],
  ["Áo thun cổ tròn tối giản", "Áo thun cổ tròn thiết kế tối giản, chất cotton co giãn nhẹ và dễ phối đồ.", 219000, "Áo thun", "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=900"],
  ["Áo polo phối viền", "Áo polo nam phối viền thanh lịch, phù hợp phong cách smart casual.", 359000, "Áo thun", "https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=900", 309000],
  ["Áo sơ mi oxford", "Sơ mi oxford dày dặn, phù hợp công sở.", 399000, "Áo sơ mi", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900"],
  ["Áo sơ mi linen", "Sơ mi linen nhẹ, thoáng mát cho mùa hè.", 429000, "Áo sơ mi", "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=900"],
  ["Áo sơ mi kẻ caro", "Sơ mi caro trẻ trung, dễ mặc riêng hoặc khoác ngoài áo thun.", 389000, "Áo sơ mi", "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900"],
  ["Áo sơ mi denim", "Sơ mi denim nam chất vải bền, phong cách casual mạnh mẽ.", 459000, "Áo sơ mi", "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=900"],
  ["Áo sơ mi trắng công sở", "Áo sơ mi trắng form slim thanh lịch, thích hợp đi làm và dự tiệc.", 419000, "Áo sơ mi", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900", 369000],
  ["Áo sơ mi sọc dọc", "Sơ mi sọc dọc giúp vóc dáng cân đối, phong cách trẻ trung và hiện đại.", 409000, "Áo sơ mi", "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900"],
  ["Áo khoác bomber", "Bomber jacket trẻ trung, giữ ấm vừa phải.", 699000, "Áo khoác", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900", 549000],
  ["Áo khoác denim", "Áo khoác denim nam phong cách, bền bỉ.", 749000, "Áo khoác", "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900"],
  ["Áo khoác dù gió", "Áo khoác dù gió nhẹ, chắn gió và dễ gấp gọn khi di chuyển.", 599000, "Áo khoác", "https://images.unsplash.com/photo-1541635930383-c21a3eab7075?w=900"],
  ["Áo khoác varsity", "Áo khoác varsity phối màu năng động, phù hợp phong cách đường phố.", 789000, "Áo khoác", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900", 679000],
  ["Áo khoác da biker", "Áo khoác da biker nam cá tính, phom gọn và đường may chắc chắn.", 1199000, "Áo khoác", "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=900"],
  ["Áo blazer nam", "Blazer nam phom hiện đại, dễ kết hợp cùng sơ mi hoặc áo thun.", 999000, "Áo khoác", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900", 899000],
  ["Quần jeans slim fit", "Quần jeans slim fit tôn dáng, dễ phối giày.", 549000, "Quần jeans", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900", 449000],
  ["Quần jeans straight fit", "Quần jeans ống đứng cổ điển, thoải mái.", 579000, "Quần jeans", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900"],
  ["Quần jeans relaxed fit", "Quần jeans relaxed fit rộng vừa, thoải mái cho ngày năng động.", 599000, "Quần jeans", "https://images.unsplash.com/photo-1511196044526-5cb3bcb7071b?w=900"],
  ["Quần jeans wash xanh", "Quần jeans wash xanh trẻ trung, chất denim dày vừa và ít bai dão.", 629000, "Quần jeans", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900", 529000],
  ["Quần jeans đen basic", "Quần jeans đen basic dễ phối, phom ôm vừa và phù hợp nhiều hoàn cảnh.", 569000, "Quần jeans", "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900"],
  ["Quần jeans ống suông", "Quần jeans ống suông phong cách hiện đại, tạo cảm giác thoải mái khi vận động.", 619000, "Quần jeans", "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=900"],
  ["Quần tây công sở", "Quần tây nam lịch sự, chất vải đứng form.", 499000, "Quần tây", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900"],
  ["Quần chinos nam", "Quần chinos linh hoạt cho công sở và cuối tuần.", 459000, "Quần tây", "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=900"],
  ["Quần short kaki", "Quần short kaki gọn gàng, phù hợp đi chơi và du lịch.", 359000, "Quần tây", "https://images.unsplash.com/photo-1697319452360-ee47502e39f6?w=900"],
  ["Quần tây slim fit", "Quần tây slim fit tôn dáng, chất vải co giãn nhẹ và ít nhăn.", 539000, "Quần tây", "https://images.unsplash.com/photo-1614492025699-2a9ea5b8c58b?w=900", 469000],
  ["Quần chinos xếp ly", "Quần chinos xếp ly thanh lịch, mang lại cảm giác thoải mái suốt ngày dài.", 489000, "Quần tây", "https://images.unsplash.com/photo-1619933317484-5f142f791902?w=900"],
  ["Quần short linen", "Quần short linen nhẹ và thoáng, phù hợp kỳ nghỉ hoặc thời tiết nóng.", 389000, "Quần tây", "https://images.unsplash.com/photo-1621496503717-095a410e1566?w=900"],
  ["Thắt lưng da nam", "Thắt lưng da tông màu đen cổ điển.", 299000, "Phụ kiện", "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=900"],
  ["Ví da nam", "Ví da nam nhỏ gọn, nhiều ngăn tiện lợi.", 349000, "Phụ kiện", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900", 279000],
  ["Nón baseball basic", "Nón baseball basic dễ phối với áo thun, jeans và sneaker.", 189000, "Phụ kiện", "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900"],
  ["Túi đeo chéo nam", "Túi đeo chéo nhỏ gọn, nhiều ngăn và phù hợp sử dụng hằng ngày.", 399000, "Phụ kiện", "https://images.unsplash.com/photo-1640101943658-793b33888edb?w=900", 329000],
  ["Kính mát nam cổ điển", "Kính mát gọng vuông phong cách cổ điển, chống tia UV và dễ phối trang phục.", 429000, "Phụ kiện", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900"],
  ["Đồng hồ dây da", "Đồng hồ nam dây da thiết kế tối giản, phù hợp trang phục công sở.", 899000, "Phụ kiện", "https://images.unsplash.com/photo-1678219716021-d988404932ec?w=900", 749000]
];

// Anh chi tiet dung chung cho gallery (demo nhieu anh san pham).
const galleryExtras = [
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900",
  "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900"
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

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@menshop.com" },
    update: {},
    create: {
      name: "Admin Men Shop",
      email: "admin@menshop.com",
      password: adminPassword,
      role: "ADMIN"
    }
  });

  const customerUser = await prisma.user.upsert({
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

  for (const [name, description, price, categoryName, imageUrl, salePrice] of products) {
    const category = categoryMap.get(categoryName);
    const normalizedSalePrice = salePrice ?? null;

    const product = await prisma.product.upsert({
      where: { slug: slugify(name) },
      update: {
        name,
        description,
        price,
        salePrice: normalizedSalePrice,
        imageUrl,
        stock: totalVariantStock,
        isActive: true,
        categoryId: category.id
      },
      create: {
        name,
        slug: slugify(name),
        description,
        price,
        salePrice: normalizedSalePrice,
        imageUrl,
        stock: totalVariantStock,
        isActive: true,
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

    // Dat lai gallery anh phu (idempotent): xoa cu, tao moi 2 anh chi tiet.
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: galleryExtras.slice(0, 2).map((url, index) => ({
        productId: product.id,
        url,
        position: index
      }))
    });
  }

  // Danh gia demo cho vai san pham dau tien.
  const reviewSamples = [
    { rating: 5, comment: "Chat vai dep, form chuan, rat hai long!" },
    { rating: 4, comment: "San pham tot so voi gia tien, giao hang nhanh." },
    { rating: 5, comment: "Mac len rat hop, se ung ho shop tiep." },
    { rating: 3, comment: "Tam on, mau hoi khac so voi anh mot chut." }
  ];
  const someProducts = await prisma.product.findMany({ take: 6, orderBy: { createdAt: "asc" } });
  for (let i = 0; i < someProducts.length; i++) {
    const product = someProducts[i];
    const r1 = reviewSamples[i % reviewSamples.length];
    await prisma.review.upsert({
      where: { productId_userId: { productId: product.id, userId: customerUser.id } },
      update: { rating: r1.rating, comment: r1.comment },
      create: { productId: product.id, userId: customerUser.id, rating: r1.rating, comment: r1.comment }
    });
    if (i % 2 === 0) {
      const r2 = reviewSamples[(i + 1) % reviewSamples.length];
      await prisma.review.upsert({
        where: { productId_userId: { productId: product.id, userId: adminUser.id } },
        update: { rating: r2.rating, comment: r2.comment },
        create: { productId: product.id, userId: adminUser.id, rating: r2.rating, comment: r2.comment }
      });
    }
  }

  // Bai viet blog demo.
  const posts = [
    {
      legacySlug: "5-cach-phoi-do-nam-thanh-lich-cho-mua-he",
      title: "5 cách phối đồ nam thanh lịch cho mùa hè",
      excerpt: "Gợi ý các công thức phối đồ nam vừa mát mẻ vừa lịch sự cho những ngày hè.",
      coverImage: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200",
      content:
        "Mùa hè là lúc thể hiện phong cách cá tính mà vẫn thoải mái. Hãy ưu tiên chất liệu cotton, linen thoáng khí.\n\n1. Áo thun trắng kết hợp quần short kaki.\n2. Sơ mi linen kết hợp quần chinos.\n3. Áo polo kết hợp quần jeans lửng.\n4. Áo thun họa tiết kết hợp quần tây sáng màu.\n5. Phụ kiện: nón, kính râm và giày sneaker trắng.\n\nNguyên tắc chung là giữ màu sắc hài hòa và lựa chọn phom dáng vừa vặn."
    },
    {
      legacySlug: "huong-dan-chon-size-quan-ao-nam-chuan-nhat",
      title: "Hướng dẫn chọn size quần áo nam chuẩn nhất",
      excerpt: "Làm sao để chọn đúng size khi mua sắm online? Bài viết này sẽ giúp bạn.",
      coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200",
      content:
        "Chọn đúng size giúp trang phục tôn dáng và thoải mái hơn.\n\n- Đo vòng ngực, vòng eo và so sánh với bảng size của shop.\n- Nếu ở giữa hai size, ưu tiên size lớn hơn để dễ chịu.\n- Với áo sơ mi, chú ý vòng cổ và độ rộng vai.\n\nMen's Shop luôn cung cấp bảng size chi tiết ở mỗi sản phẩm."
    },
    {
      legacySlug: "xu-huong-thoi-trang-nam-noi-bat-nam-nay",
      title: "Xu hướng thời trang nam nổi bật năm nay",
      excerpt: "Điểm qua những xu hướng thời trang nam đang được ưa chuộng.",
      coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200",
      content:
        "Năm nay, phong cách tối giản (minimal) và tông màu trung tính lên ngôi.\n\nCác món đồ oversized, chất liệu bền vững và thiết kế đa năng được ưa chuộng. Phụ kiện da thật đơn giản nhưng tinh tế."
    }
  ];
  for (const post of posts) {
    const { legacySlug, ...postData } = post;
    const slug = slugify(post.title);
    const existingPost = await prisma.post.findFirst({
      where: { slug: { in: [legacySlug, slug] } }
    });

    if (existingPost) {
      await prisma.post.update({
        where: { id: existingPost.id },
        data: { ...postData, slug }
      });
    } else {
      await prisma.post.create({
        data: { ...postData, slug }
      });
    }
  }

  // Ma giam gia demo.
  const coupons = [
    {
      code: "WELCOME10",
      description: "Giam 10% cho don tu 300k, toi da 100k.",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 300000,
      maxDiscount: 100000
    },
    {
      code: "GIAM50K",
      description: "Giam 50k cho don tu 500k.",
      discountType: "FIXED",
      discountValue: 50000,
      minOrderValue: 500000
    }
  ];
  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon
    });
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
