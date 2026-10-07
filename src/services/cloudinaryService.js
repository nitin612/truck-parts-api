const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (filePath, folder = 'truck-parts/products') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    // Graceful fallback for local development without Cloudinary credentials configured
    return {
      url: `/uploads/${require('path').basename(filePath)}`,
      publicId: `local_${Date.now()}`
    };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto'
    });
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      url: `/uploads/${require('path').basename(filePath)}`,
      publicId: `fallback_${Date.now()}`
    };
  }
};

const deleteImage = async (publicId) => {
  if (!publicId || publicId.startsWith('local_') || publicId.startsWith('fallback_')) return true;
  if (!process.env.CLOUDINARY_CLOUD_NAME) return true;

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

module.exports = {
  uploadImage,
  deleteImage
};
