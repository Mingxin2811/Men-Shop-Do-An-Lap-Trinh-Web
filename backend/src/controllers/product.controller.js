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

const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      size,
      color,
      page = 1,
      limit = 12,
      sort = "newest"
    } = req.query;

    const take = Math.max(parseInt(limit, 10) || 12, 1);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (currentPage - 1) * take;
    const where = { isActive: true };

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
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

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        skip,
        take,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    return successResponse(res, "Lay danh sach san pham thanh cong", {
      products,
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
      where.name = { contains: search, mode: "insensitive" };
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
        include: { category: true, variants: true },
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
      include: { category: true, variants: true }
    });

    if (!product) {
      return errorResponse(res, "Khong tim thay san pham", 404);
    }

    return successResponse(res, "Lay chi tiet san pham thanh cong", product);
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { categoryId, name, description, price, imageUrl, stock, variants, isActive } = req.body;
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

    const product = await prisma.product.create({
      data: {
        categoryId,
        name: name.trim(),
        slug,
        description: description || "",
        price: Number(price),
        imageUrl: imageUrl || "",
        stock: Number(stock),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        variants: {
          create: normalizeVariants(variants)
        }
      },
      include: { category: true, variants: true }
    });

    return successResponse(res, "Them san pham thanh cong", product, 201);
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, imageUrl, stock, variants, isActive } = req.body;

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

    const product = await prisma.$transaction(async (tx) => {
      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        dataToUpdate.variants = {
          create: normalizeVariants(variants)
        };
      }

      return tx.product.update({
        where: { id },
        data: dataToUpdate,
        include: { category: true, variants: true }
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
