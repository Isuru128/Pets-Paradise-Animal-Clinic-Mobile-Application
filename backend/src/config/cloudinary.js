const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.api.ping()
    .then(() => console.log('✅ Cloudinary Connected'))
    .catch((error) => console.error('❌ Cloudinary connection failed:', error.message));

function createCloudinaryStorage(folder, allowedFormats) {
    return new CloudinaryStorage({
        cloudinary,
        params: {
            folder: `pets-paradise/${folder}`,
            resource_type: 'auto', // handles images AND pdfs correctly
            allowed_formats: allowedFormats,
            public_id: (req, file) => {
                const base = path_basename(file.originalname);
                return `${Date.now()}-${Math.round(Math.random() * 1E9)}-${base}`;
            }
        }
    });
}

function path_basename(originalname) {
    const name = (originalname || 'file').split('.')[0];
    return name.replace(/[^a-zA-Z0-9-_]/g, '');
}

module.exports = { cloudinary, createCloudinaryStorage };