const ContentPage = require('../models/ContentPage');
const HomeSection = require('../models/HomeSection');
const CustomError = require('../utils/CustomError');

// Content Pages (Policies, Warranty, Freight, About)
const getPageBySlug = async (request, reply) => {
  const page = await ContentPage.findOne({ slug: request.params.slug, isPublished: true });
  if (!page) throw new CustomError('Page not found', 404, 'PAGE_NOT_FOUND');
  reply.send({ success: true, data: { page } });
};

const adminGetPages = async (request, reply) => {
  const pages = await ContentPage.find().sort({ createdAt: -1 });
  reply.send({ success: true, count: pages.length, data: { pages } });
};

const adminCreateOrUpdatePage = async (request, reply) => {
  const { title, slug, content, summary, metaTitle, metaDescription, isPublished } = request.body;
  
  let page = null;
  if (request.params.id) {
    page = await ContentPage.findById(request.params.id);
  } else if (slug) {
    page = await ContentPage.findOne({ slug });
  }

  if (page) {
    if (title) page.title = title;
    if (content) page.content = content;
    if (summary !== undefined) page.summary = summary;
    if (metaTitle !== undefined) page.metaTitle = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (isPublished !== undefined) page.isPublished = isPublished;
    await page.save();
  } else {
    page = await ContentPage.create({
      title,
      slug,
      content,
      summary,
      metaTitle,
      metaDescription,
      isPublished: isPublished !== undefined ? isPublished : true
    });
  }

  reply.send({ success: true, message: 'Content page saved', data: { page } });
};

const adminDeletePage = async (request, reply) => {
  await ContentPage.findByIdAndDelete(request.params.id);
  reply.send({ success: true, message: 'Page deleted' });
};

// Dynamic Home Sections
const getHomeSections = async (request, reply) => {
  const sections = await HomeSection.find({ isActive: true })
    .populate('products', 'name sku oemPartNumber pricing images condition')
    .populate('categories', 'name slug image')
    .populate('brands', 'name slug logo')
    .sort({ sortOrder: 1 });

  reply.send({ success: true, count: sections.length, data: { sections } });
};

const adminGetHomeSections = async (request, reply) => {
  const sections = await HomeSection.find().sort({ sortOrder: 1, createdAt: -1 });
  reply.send({ success: true, count: sections.length, data: { sections } });
};

const adminCreateHomeSection = async (request, reply) => {
  const section = await HomeSection.create(request.body);
  reply.status(201).send({ success: true, message: 'Home section created', data: { section } });
};

const adminUpdateHomeSection = async (request, reply) => {
  const section = await HomeSection.findByIdAndUpdate(request.params.id, request.body, { new: true });
  if (!section) throw new CustomError('Section not found', 404, 'SECTION_NOT_FOUND');
  reply.send({ success: true, message: 'Home section updated', data: { section } });
};

const adminDeleteHomeSection = async (request, reply) => {
  await HomeSection.findByIdAndDelete(request.params.id);
  reply.send({ success: true, message: 'Home section deleted' });
};

module.exports = {
  getPageBySlug,
  adminGetPages,
  adminCreateOrUpdatePage,
  adminDeletePage,
  getHomeSections,
  adminGetHomeSections,
  adminCreateHomeSection,
  adminUpdateHomeSection,
  adminDeleteHomeSection
};
