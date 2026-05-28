const prisma = require("../config/db");
const slugify = require("../utils/slugify");
const { successResponse, errorResponse } = require("../utils/response");

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return successResponse(res, "Lay danh sach danh muc thanh cong", categories);
  } catch (error) {
    return next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name);

    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return errorResponse(res, "Danh muc da ton tai", 409);
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null
      }
    });

    return successResponse(res, "Them danh muc thanh cong", category, 201);
  } catch (error) {
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return errorResponse(res, "Khong tim thay danh muc", 404);
    }

    const dataToUpdate = {};
    if (name !== undefined) {
      const slug = slugify(name);
      const duplicatedSlug = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id }
        }
      });

      if (duplicatedSlug) {
        return errorResponse(res, "Ten danh muc da ton tai", 409);
      }

      dataToUpdate.name = name.trim();
      dataToUpdate.slug = slug;
    }
    if (description !== undefined) {
      dataToUpdate.description = description || null;
    }

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate
    });

    return successResponse(res, "Cap nhat danh muc thanh cong", category);
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return errorResponse(res, "Khong tim thay danh muc", 404);
    }

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return errorResponse(res, "Khong the xoa danh muc dang co san pham", 400);
    }

    await prisma.category.delete({ where: { id } });
    return successResponse(res, "Xoa danh muc thanh cong");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
