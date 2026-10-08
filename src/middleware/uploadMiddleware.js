const multer = require('fastify-multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const os = require('os');
const uploadDir = path.join(os.tmpdir(), 'truck-parts-uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // Ignore filesystem race conditions
}

// Allowed MIME types mapped to safe extensions (SVGs excluded to prevent stored XSS attacks)
const ALLOWED_MIME_MAP = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'application/pdf': ['.pdf']
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const allowedExts = ALLOWED_MIME_MAP[file.mimetype] || [];
    const safeExt = allowedExts.includes(rawExt) ? rawExt : (allowedExts[0] || '.bin');
    const safePrefix = (file.fieldname || 'upload').replace(/[^a-zA-Z0-9]/g, '');
    const randomHex = crypto.randomBytes(8).toString('hex');
    cb(null, `${safePrefix}-${Date.now()}-${randomHex}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ALLOWED_MIME_MAP[file.mimetype];
  if (!allowedExts) {
    return cb(new Error('Invalid file type. Only JPG, PNG, WEBP, AVIF, and PDF files are allowed.'), false);
  }

  const fileExt = path.extname(file.originalname || '').toLowerCase();
  if (!allowedExts.includes(fileExt)) {
    return cb(new Error(`File extension "${fileExt}" does not match claimed MIME type "${file.mimetype}".`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
    files: 5 // Max 5 files per upload request
  }
});

module.exports = upload;
