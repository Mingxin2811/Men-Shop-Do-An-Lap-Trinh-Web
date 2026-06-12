const prisma = require("../config/db");
const slugify = require("../utils/slugify");
const { successResponse, errorResponse } = require("../utils/response");

// GET /api/posts - danh sach bai viet da xuat ban (cong khai)
const getPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    return successResponse(res, "Lay danh sach bai viet thanh cong", posts);
  } catch (error) {
    return next(error);
  }
};

// GET /api/posts/:slug - chi tiet bai viet theo slug (cong khai)
const getPostBySlug = async (req, res, next) => {
  try {
    const post = await prisma.post.findFirst({
      where: { slug: req.params.slug, published: true }
    });
    if (!post) {
      return errorResponse(res, "Khong tim thay bai viet", 404);
    }
    return successResponse(res, "Lay bai viet thanh cong", post);
  } catch (error) {
    return next(error);
  }
};

// GET /api/posts/admin/all - tat ca bai viet (admin)
const getAdminPosts = async (req, res, next) => {
  try {
    const { status, createdDate } = req.query;
    const where = {};

    if (status === "published") where.published = true;
    if (status === "draft") where.published = false;
    if (createdDate) {
      const start = new Date(`${createdDate}T00:00:00.000`);
      const end = new Date(`${createdDate}T23:59:59.999`);
      if (!Number.isNaN(start.getTime())) {
        where.createdAt = { gte: start, lte: end };
      }
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    return successResponse(res, "Lay danh sach bai viet quan tri thanh cong", posts);
  } catch (error) {
    return next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, published } = req.body;
    const slug = slugify(title);

    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return errorResponse(res, "Tiêu đề bài viết đã tồn tại.", 409);
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        ...(published !== undefined ? { published: Boolean(published) } : {})
      }
    });
    return successResponse(res, "Tạo bài viết thành công.", post, 201);
  } catch (error) {
    return next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, coverImage, published } = req.body;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Không tìm thấy bài viết.", 404);
    }

    const data = {};
    if (title !== undefined) {
      const slug = slugify(title);
      const dup = await prisma.post.findFirst({ where: { slug, NOT: { id } } });
      if (dup) {
        return errorResponse(res, "Tiêu đề bài viết đã tồn tại.", 409);
      }
      data.title = title.trim();
      data.slug = slug;
    }
    if (excerpt !== undefined) data.excerpt = excerpt || null;
    if (content !== undefined) data.content = content;
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (published !== undefined) data.published = Boolean(published);

    const post = await prisma.post.update({ where: { id }, data });
    return successResponse(res, "Cập nhật bài viết thành công.", post);
  } catch (error) {
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Không tìm thấy bài viết.", 404);
    }
    await prisma.post.delete({ where: { id } });
    return successResponse(res, "Xóa bài viết thành công.");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  getAdminPosts,
  createPost,
  updatePost,
  deletePost
};
