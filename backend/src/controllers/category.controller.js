import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Hàm hỗ trợ chuyển đổi Tiếng Việt có dấu thành slug đơn giản
const makeSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Tên danh mục không được rỗng" });
    }

    const slug = makeSlug(name);
    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "Danh mục này đã tồn tại (trùng slug)" });
    }

    const category = await prisma.category.create({
      data: { name, slug, description }
    });

    return res.status(201).json({
      success: true,
      message: "Thêm danh mục thành công",
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const dataToUpdate = { description };
    if (name) {
      dataToUpdate.name = name;
      dataToUpdate.slug = makeSlug(name);
    }

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa danh mục này vì đang có sản phẩm liên quan"
      });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công"
    });
  } catch (error) {
    next(error);
  }
};