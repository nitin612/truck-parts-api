const CarouselSlide = require('../models/CarouselSlide');
const CustomError = require('../utils/CustomError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');
const fs = require('fs');

const getSlides = async (request, reply) => {
  const slides = await CarouselSlide.find({ isActive: true }).sort({ sortOrder: 1 });
  reply.send({ success: true, count: slides.length, data: { slides } });
};

const adminGetSlides = async (request, reply) => {
  const slides = await CarouselSlide.find().sort({ sortOrder: 1, createdAt: -1 });
  reply.send({ success: true, count: slides.length, data: { slides } });
};

const adminCreateSlide = async (request, reply) => {
  const slideData = request.body || {};

  if (request.file) {
    const uploaded = await uploadImage(request.file.path, 'truck-parts/carousel');
    slideData.image = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  const slide = await CarouselSlide.create(slideData);
  reply.status(201).send({ success: true, message: 'Carousel slide created', data: { slide } });
};

const adminUpdateSlide = async (request, reply) => {
  const slide = await CarouselSlide.findById(request.params.id);
  if (!slide) throw new CustomError('Slide not found', 404, 'SLIDE_NOT_FOUND');

  const updateData = request.body || {};

  if (request.file) {
    if (slide.image?.publicId) await deleteImage(slide.image.publicId);
    const uploaded = await uploadImage(request.file.path, 'truck-parts/carousel');
    updateData.image = uploaded;
    try { fs.unlinkSync(request.file.path); } catch (e) {}
  }

  Object.assign(slide, updateData);
  await slide.save();

  reply.send({ success: true, message: 'Slide updated', data: { slide } });
};

const adminDeleteSlide = async (request, reply) => {
  const slide = await CarouselSlide.findById(request.params.id);
  if (!slide) throw new CustomError('Slide not found', 404, 'SLIDE_NOT_FOUND');

  if (slide.image?.publicId) await deleteImage(slide.image.publicId);
  await slide.deleteOne();

  reply.send({ success: true, message: 'Slide deleted successfully' });
};

module.exports = {
  getSlides,
  adminGetSlides,
  adminCreateSlide,
  adminUpdateSlide,
  adminDeleteSlide
};
