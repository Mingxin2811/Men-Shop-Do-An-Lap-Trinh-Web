const prisma = require("../config/db");
const slugify = require("../utils/slugify");
const { successResponse, errorResponse } = require("../utils/response");

const normalizeVariants = (variants = []) => {
  return variants.map((variant) => ({
    size: String(variant.size || "").trim(),
    color: String(variant.color || "").trim(),
    stock: Number(variant.stock || 0)
  }));
};

const getVariantStockTotal = (variants = []) =>
  normalizeVariants(variants).reduce((total, variant) => total + variant.stock, 0);

const hasInvalidVariantStockTotal = (stock, variants) =>
  Array.isArray(variants) &&
  variants.length > 0 &&
  Number(stock) !== getVariantStockTotal(variants);

// Chuẩn hoá giá khuyến mãi: trả về null nếu trống, hoặc số đã làm tròn.
const parseSalePrice = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

// Chuẩn hoá danh sách ảnh phụ (gallery): bỏ url rỗng, gán thứ tự (position).
const normalizeImages = (images = []) =>
  (Array.isArray(images) ? images : [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .map((url) => String(url || "").trim())
    .filter(Boolean)
    .map((url, index) => ({ url, position: index }));

// Gắn averageRating + reviewCount cho sản phẩm từ mảng reviews (chỉ chứa rating).
const withRating = (product) => {
  const ratings = (product.reviews || []).map((r) => r.rating);
  const reviewCount = ratings.length;
  const averageRating = reviewCount
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / reviewCount) * 10) / 10
    : 0;
  const { reviews, ...rest } = product;
  return { ...rest, reviewCount, averageRating };
};

const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      size,
      color,
      onSale,
      inStock,
      page = 1,
      limit = 12,
      sort = "newest"
    } = req.query;

    const take = Math.max(parseInt(limit, 10) || 12, 1);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * take;
    const where = { isActive: true };
    // Cac nhom dieu kien dang OR duoc gom vao AND de khong de len nhau.
    const and = [];

    if (search) {
      and.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      });
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size } : {}),
          ...(color ? { color } : {})
        }
      };
    }

    // Chi lay san pham dang giam gia (co salePrice hop le).
    if (onSale === "true") {
      where.salePrice = { gt: 0 };
    }

    // Chi lay san pham con hang (con ton kho o san pham hoac o bien the).
    if (inStock === "true") {
      and.push({
        OR: [
          { stock: { gt: 0 } },
          { variants: { some: { stock: { gt: 0 } } } }
        ]
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true, reviews: { select: { rating: true } } },
        skip,
        take,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    return successResponse(res, "Lay danh sach san pham thanh cong", {
      products: products.map(withRating),
      totalProducts,
      totalPages: Math.ceil(totalProducts / take),
      currentPage
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 100,
      sort = "newest",
      status = "all"
    } = req.query;

    const take = Math.max(parseInt(limit, 10) || 100, 1);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * take;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (status === "active") where.isActive = true;
    if (status === "hidden") where.isActive = false;

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true, images: { orderBy: { position: "asc" } } },
        skip,
        take,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    return successResponse(res, "Lay danh sach san pham quan tri thanh cong", {
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / take),
      currentPage
    });
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: "asc" } },
        reviews: { select: { rating: true } }
      }
    });

    if (!product) {
      return errorResponse(res, "Khong tim thay san pham", 404);
    }

    return successResponse(res, "Lay chi tiet san pham thanh cong", withRating(product));
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { categoryId, name, description, price, salePrice, imageUrl, stock, variants, images, isActive } = req.body;
    const slug = slugify(name);

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return errorResponse(res, "Danh muc khong ton tai", 404);
    }

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      return errorResponse(res, "San pham da ton tai", 409);
    }

    if (hasInvalidVariantStockTotal(stock, variants)) {
      return errorResponse(
        res,
        "Tồn kho tổng phải bằng tổng tồn kho của các biến thể",
        400
      );
    }

    const normalizedSalePrice = parseSalePrice(salePrice);
    if (normalizedSalePrice !== null && normalizedSalePrice >= Number(price)) {
      return errorResponse(res, "Giá khuyến mãi phải nhỏ hơn giá gốc", 400);
    }

    const product = await prisma.product.create({
      data: {
        categoryId,
        name: name.trim(),
        slug,
        description: description || "",
        price: Number(price),
        salePrice: normalizedSalePrice,
        imageUrl: imageUrl || "",
        stock: Number(stock),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        variants: {
          create: normalizeVariants(variants)
        },
        images: {
          create: normalizeImages(images)
        }
      },
      include: { category: true, variants: true, images: { orderBy: { position: "asc" } } }
    });

    return successResponse(res, "Them san pham thanh cong", product, 201);
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, salePrice, imageUrl, stock, variants, images, isActive } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return errorResponse(res, "Khong tim thay san pham", 404);
    }

    if (
      variants !== undefined &&
      hasInvalidVariantStockTotal(
        stock !== undefined ? stock : existingProduct.stock,
        variants
      )
    ) {
      return errorResponse(
        res,
        "Tồn kho tổng phải bằng tổng tồn kho của các biến thể",
        400
      );
    }

    const dataToUpdate = {};

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return errorResponse(res, "Danh muc khong ton tai", 404);
      }
      dataToUpdate.categoryId = categoryId;
    }

    if (name !== undefined) {
      const slug = slugify(name);
      const duplicatedSlug = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      });

      if (duplicatedSlug) {
        return errorResponse(res, "Ten san pham da ton tai", 409);
      }

      dataToUpdate.name = name.trim();
      dataToUpdate.slug = slug;
    }
    if (description !== undefined) dataToUpdate.description = description || "";
    if (price !== undefined) dataToUpdate.price = Number(price);
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl || "";
    if (stock !== undefined) dataToUpdate.stock = Number(stock);
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    if (salePrice !== undefined) {
      const normalizedSalePrice = parseSalePrice(salePrice);
      const effectivePrice = price !== undefined ? Number(price) : Number(existingProduct.price);
      if (normalizedSalePrice !== null && normalizedSalePrice >= effectivePrice) {
        return errorResponse(res, "Giá khuyến mãi phải nhỏ hơn giá gốc", 400);
      }
      dataToUpdate.salePrice = normalizedSalePrice;
    }

    const product = await prisma.$transaction(async (tx) => {
      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        dataToUpdate.variants = {
          create: normalizeVariants(variants)
        };
      }

      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        dataToUpdate.images = {
          create: normalizeImages(images)
        };
      }

      return tx.product.update({
        where: { id },
        data: dataToUpdate,
        include: { category: true, variants: true, images: { orderBy: { position: "asc" } } }
      });
    });

    return successResponse(res, "Cap nhat san pham thanh cong", product);
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return errorResponse(res, "Khong tim thay san pham", 404);
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    return successResponse(res, "An san pham thanh cong");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
