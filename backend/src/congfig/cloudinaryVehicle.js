const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Config Cloudinary (dùng chung config đã có)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage cho ảnh xe
const vehicleStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'UTE_Shop/vehicles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `vehicle-${uniqueSuffix}`;
    },
  },
});

// Middleware upload nhiều ảnh (tối đa 10 ảnh)
const uploadVehicleImages = multer({
  storage: vehicleStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB mỗi ảnh
    files: 10, // Tối đa 10 file
  },
}).array('images', 10);

// Xóa ảnh khỏi Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Extract public_id từ URL
const extractPublicId = (url) => {
  if (!url) return null;
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

module.exports = {
  cloudinary,
  uploadVehicleImages,
  deleteFromCloudinary,
  extractPublicId,
};
