const Blog = require('../models/Blog');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const fs = require('fs');

const getBlogs = async (request, reply) => {
  const { tag, category, search, page = 1, limit = 10 } = request.query;
  const filter = { isPublished: true };

  if (tag) filter.tags = tag;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Blog.countDocuments(filter);
  const blogs = await Blog.find(filter)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  reply.send({
    success: true,
    data: {
      blogs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    }
  });
};

const getBlogBySlug = async (request, reply) => {
  const blog = await Blog.findOne({ slug: request.params.slug, isPublished: true });
  if (!blog) throw new CustomError('Article not found', 404, 'BLOG_NOT_FOUND');

  blog.viewsCount = (blog.viewsCount || 0) + 1;
  await blog.save();

  const related = await Blog.find({
    category: blog.category,
    _id: { $ne: blog._id },
    isPublished: true
  }).limit(3).select('title slug coverImage publishedAt readTimeMinutes');

  reply.send({ success: true, data: { blog, related } });
};

const adminGetBlogs = async (request, reply) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  reply.send({ success: true, count: blogs.length, data: { blogs } });
};

const adminCreateBlog = async (request, reply) => {
  const data = request.body || {};

  if (typeof data.tags === 'string') {
    try { data.tags = JSON.parse(data.tags); } catch (e) { data.tags = data.tags.split(',').map(t => t.trim()); }
  }

  if (request.file) {
    const uploaded = await uploadImage(request.file.path, 'truck-parts/blogs');
    data.coverImage = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  const blog = await Blog.create(data);
  reply.status(201).send({ success: true, message: 'Article created successfully', data: { blog } });
};

const adminUpdateBlog = async (request, reply) => {
  const blog = await Blog.findById(request.params.id);
  if (!blog) throw new CustomError('Article not found', 404, 'BLOG_NOT_FOUND');

  const data = request.body || {};
  if (typeof data.tags === 'string') {
    try { data.tags = JSON.parse(data.tags); } catch (e) { data.tags = data.tags.split(',').map(t => t.trim()); }
  }

  if (request.file) {
    if (blog.coverImage?.publicId) await deleteImage(blog.coverImage.publicId);
    const uploaded = await uploadImage(request.file.path, 'truck-parts/blogs');
    data.coverImage = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  Object.assign(blog, data);
  await blog.save();

  reply.send({ success: true, message: 'Article updated successfully', data: { blog } });
};

const adminDeleteBlog = async (request, reply) => {
  const blog = await Blog.findById(request.params.id);
  if (!blog) throw new CustomError('Article not found', 404, 'BLOG_NOT_FOUND');

  if (blog.coverImage?.publicId) await deleteImage(blog.coverImage.publicId);
  await blog.deleteOne();

  reply.send({ success: true, message: 'Article deleted successfully' });
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  adminGetBlogs,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog
};
