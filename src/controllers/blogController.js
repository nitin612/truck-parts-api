const Blog = require('../models/Blog');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const fs = require('fs');
const escapeRegExp = require('../utils/escapeRegExp');

const getBlogs = async (request, reply) => {
  const { tag, category, search, page = 1, limit = 10 } = request.query;
  const filter = { isPublished: true };

  if (tag) filter.tags = tag;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: escapeRegExp(search), $options: 'i' } },
      { summary: { $regex: escapeRegExp(search), $options: 'i' } }
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

const mongoose = require('mongoose');

const adminGetBlogs = async (request, reply) => {
  const blogs = await Blog.find().sort({ publishedAt: -1, createdAt: -1 });
  reply.send({ success: true, count: blogs.length, data: { blogs }, blogs });
};

const adminGetBlogById = async (request, reply) => {
  const filter = mongoose.Types.ObjectId.isValid(request.params.id) ? { _id: request.params.id } : { slug: request.params.id };
  const blog = await Blog.findOne(filter);
  if (!blog) throw new CustomError('Article not found', 404, 'BLOG_NOT_FOUND');
  reply.send({ success: true, data: { blog }, blog });
};

const adminCreateBlog = async (request, reply) => {
  const data = { ...(request.body || {}) };

  if (typeof data.tags === 'string') {
    try { data.tags = JSON.parse(data.tags); } catch (e) { data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean); }
  }
  if (typeof data.body === 'string') {
    try { data.body = JSON.parse(data.body); } catch (e) {}
  }
  if (typeof data.isPublished === 'string') {
    data.isPublished = data.isPublished === 'true';
  }
  if (data.readTimeMinutes !== undefined) {
    data.readTimeMinutes = Number(data.readTimeMinutes) || 4;
  }
  if (!data.slug && data.title) {
    const slugify = require('slugify');
    data.slug = slugify(data.title, { lower: true, strict: true });
  }

  if (data.slug) {
    const existing = await Blog.findOne({ slug: data.slug });
    if (existing) {
      throw new CustomError(`An article with slug "${data.slug}" already exists. Slugs must be unique.`, 400, 'SLUG_CONFLICT');
    }
  }

  if (request.file) {
    const uploaded = await uploadImage(request.file.path, 'aurex_truck_parts/blogs');
    data.coverImage = uploaded;
    data.img = uploaded.url;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  } else if (data.imageUrl && !data.coverImage) {
    data.coverImage = { url: data.imageUrl, publicId: 'blog_' + Date.now() };
    data.img = data.imageUrl;
  } else if (typeof data.coverImage === 'string') {
    data.coverImage = { url: data.coverImage, publicId: 'blog_' + Date.now() };
    data.img = data.coverImage.url;
  }

  const blog = await Blog.create(data);
  reply.status(201).send({ success: true, message: 'Article created successfully', data: { blog }, blog });
};

const adminUpdateBlog = async (request, reply) => {
  const filter = mongoose.Types.ObjectId.isValid(request.params.id) ? { _id: request.params.id } : { slug: request.params.id };
  const blog = await Blog.findOne(filter);
  if (!blog) throw new CustomError('Article not found', 404, 'BLOG_NOT_FOUND');

  const data = { ...(request.body || {}) };
  if (typeof data.tags === 'string') {
    try { data.tags = JSON.parse(data.tags); } catch (e) { data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean); }
  }
  if (typeof data.body === 'string') {
    try { data.body = JSON.parse(data.body); } catch (e) {}
  }
  if (typeof data.isPublished === 'string') {
    data.isPublished = data.isPublished === 'true';
  }
  if (data.readTimeMinutes !== undefined) {
    data.readTimeMinutes = Number(data.readTimeMinutes) || 4;
  }
  if (data.slug && data.slug !== blog.slug) {
    const existing = await Blog.findOne({ slug: data.slug, _id: { $ne: blog._id } });
    if (existing) {
      throw new CustomError(`An article with slug "${data.slug}" already exists. Slugs must be unique.`, 400, 'SLUG_CONFLICT');
    }
  }

  if (request.file) {
    if (blog.coverImage?.publicId) await deleteImage(blog.coverImage.publicId);
    const uploaded = await uploadImage(request.file.path, 'aurex_truck_parts/blogs');
    data.coverImage = uploaded;
    data.img = uploaded.url;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  } else if (data.imageUrl) {
    data.coverImage = { url: data.imageUrl, publicId: blog.coverImage?.publicId || ('blog_' + Date.now()) };
    data.img = data.imageUrl;
  } else if (typeof data.coverImage === 'string') {
    data.coverImage = { url: data.coverImage, publicId: blog.coverImage?.publicId || ('blog_' + Date.now()) };
    data.img = data.coverImage;
  }

  Object.assign(blog, data);
  await blog.save();

  reply.send({ success: true, message: 'Article updated successfully', data: { blog }, blog });
};

const adminDeleteBlog = async (request, reply) => {
  const filter = mongoose.Types.ObjectId.isValid(request.params.id) ? { _id: request.params.id } : { slug: request.params.id };
  const blog = await Blog.findOne(filter);
  if (!blog) throw new CustomError('Article not found', 404, 'BLOG_NOT_FOUND');

  if (blog.coverImage?.publicId) await deleteImage(blog.coverImage.publicId);
  await blog.deleteOne();

  reply.send({ success: true, message: 'Article deleted successfully' });
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  adminGetBlogs,
  adminGetBlogById,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog
};
