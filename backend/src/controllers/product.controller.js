import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const makeSlug = (text) => {
  return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
};

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, size, color, page = 1, limit = 12, sort } = req.query;

    const where = { isActive: true };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (size || color) {
      where.product_variants = {
        some: {
          ...(size && { size }),
          ...(color && { color })
        }
      };
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [products, totalProducts] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true, product_variants: true },
        skip,
        take,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      data: {
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / take),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, product_variants: true }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    return res.status(200).json({ success: true, message: "Lấy chi tiết sản phẩm thành công", data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { categoryId, name, description, price, imageUrl, stock, variants } = req.body;

    if (!name || !price || price <= 0 || stock < 0) {
      return res.status(400).json({ success: false, message: "Dữ liệu sản phẩm không hợp lệ" });
    }

    const slug = makeSlug(name);
    
    // Sử dụng kỹ thuật Nested Writes của Prisma để tạo Product kèm các Variant cùng lúc
    const product = await prisma.product.create({
      data: {
        categoryId,
        name,
        slug,
        description,
        price,
        imageUrl,
        stock,
        product_variants: {
          create: variants || [] // Mảng dạng [{ size: "M", color: "Black", stock: 10 }]
        }
      },
      include: { product_variants: true }
    });

    return res.status(201).json({ success: true, message: "Thêm sản phẩm thành công", data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId, name, description, price, imageUrl, stock, variants } = req.body;

    const dataToUpdate = { categoryId, description, price, imageUrl, stock };
    if (name) {
      dataToUpdate.name = name;
      dataToUpdate.slug = makeSlug(name);
    }

    // Cập nhật thông tin cơ bản và xử lý đơn giản biến thể (xóa cũ tạo mới nếu truyền mảng mới)
    const product = await prisma.$transaction(async (tx) => {
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        dataToUpdate.product_variants = {
          create: variants
        };
      }
      return await tx.product.update({
        where: { id },
        data: dataToUpdate,
        include: { product_variants: true }
      });
    });

    return res.status(200).json({ success: true, message: "Cập nhật sản phẩm thành công", data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Thực hiện Soft Delete theo yêu cầu đề bài
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
    return res.status(200).json({ success: true, message: "Ẩn sản phẩm thành công (Soft delete)" });
  } catch (error) {
    next(error);
  }
};