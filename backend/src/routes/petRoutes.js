const express = require('express');
const multer = require('multer');
const router = express.Router();

const { createCloudinaryStorage } = require('../config/cloudinary');

const {
    createPet,
    getMyPets,
    getAllPets,
    updatePet,
    addPetRecord,
    updatePetRecord,
    deletePet
} = require('../controllers/petController');

const { auth, adminOnly } = require('../middleware/authMiddleware');

const petImageStorage = createCloudinaryStorage('pet-images', ['jpg', 'jpeg', 'png', 'webp']);

const uploadPetImage = multer({
    storage: petImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error('Only JPG, PNG, or WEBP pet images are allowed'));
    }
});

const petRecordStorage = createCloudinaryStorage('pet-records', ['jpg', 'jpeg', 'png', 'webp', 'pdf']);

const uploadPetRecord = multer({
    storage: petRecordStorage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error('Only JPG, PNG, WEBP, or PDF reports are allowed'));
    }
});

router.post('/', auth, handlePetImageUpload, createPet);
router.get('/my-pets', auth, getMyPets);

router.get('/', auth, adminOnly, getAllPets);
router.put('/:id', auth, handlePetImageUpload, updatePet);
router.post('/:id/records', auth, adminOnly, handlePetRecordUpload, addPetRecord);
router.put('/:id/records/:recordId', auth, adminOnly, handlePetRecordUpload, updatePetRecord);
router.delete('/:id', auth, deletePet);

module.exports = router;

function handlePetImageUpload(req, res, next) {
    uploadPetImage.single('petImage')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ msg: error.message });
        }

        next();
    });
}

function handlePetRecordUpload(req, res, next) {
    uploadPetRecord.single('recordAttachment')(req, res, (error) => {
        if (error) {
            return res.status(400).json({ msg: error.message });
        }

        next();
    });
}