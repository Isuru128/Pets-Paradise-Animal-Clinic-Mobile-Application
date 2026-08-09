const Pet = require('../models/Pet');

exports.createPet = async (req, res) => {
    try {
        const {
            name,
            type,
            breed,
            birthday,
            gender,
            medicalNotes,
            imageUrl,
            status
        } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                msg: 'Pet name and type are required'
            });
        }

        if (!isPastDate(birthday)) {
            return res.status(400).json({
                msg: 'Birthday must be a past date'
            });
        }

        const pet = await Pet.create({
            owner: req.user.id,
            name,
            type,
            breed: breed || '',
            birthday: birthday || '',
            gender: gender || '',
            medicalNotes: medicalNotes || '',
            imageUrl: req.file ? `/uploads/pet-images/${req.file.filename}` : imageUrl || '',
            status: status || 'Healthy'
        });

        res.status(201).json(pet);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getMyPets = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user.id })
            .populate('records.createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(pets);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getAllPets = async (req, res) => {
    try {
        const pets = await Pet.find()
            .populate('owner', 'name email phone')
            .populate('records.createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(pets);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updatePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ msg: 'Pet not found' });
        }

        const isOwner = pet.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ msg: 'Not allowed to update this pet' });
        }

        if (req.body.birthday !== undefined && !isPastDate(req.body.birthday)) {
            return res.status(400).json({
                msg: 'Birthday must be a past date'
            });
        }

        const allowedFields = ['name', 'type', 'breed', 'birthday', 'gender', 'medicalNotes', 'imageUrl', 'status'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (req.file) {
            updates.imageUrl = `/uploads/pet-images/${req.file.filename}`;
        }

        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('owner', 'name email phone').populate('records.createdBy', 'name email');

        res.json(updatedPet);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

function isPastDate(value) {
    if (!value) {
        return false;
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
}

exports.addPetRecord = async (req, res) => {
    try {
        const { title, subtitle, category, date, notes, attachmentUrl } = req.body;

        if (!title) {
            return res.status(400).json({ msg: 'Record title is required' });
        }

        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ msg: 'Pet not found' });
        }

        pet.records.push({
            title,
            subtitle: subtitle || '',
            category: category || 'Vaccination',
            date: date || '',
            notes: notes || '',
            attachmentUrl: req.file ? `/uploads/pet-records/${req.file.filename}` : attachmentUrl || '',
            attachmentName: req.file ? req.file.originalname : '',
            attachmentMimeType: req.file ? req.file.mimetype : '',
            createdBy: req.user.id
        });

        await pet.save();

        const updatedPet = await Pet.findById(pet._id)
            .populate('owner', 'name email phone')
            .populate('records.createdBy', 'name email');

        res.status(201).json(updatedPet);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updatePetRecord = async (req, res) => {
    try {
        const { title, subtitle, category, date, notes, attachmentUrl } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ msg: 'Record title is required' });
        }

        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ msg: 'Pet not found' });
        }

        const record = pet.records.id(req.params.recordId);

        if (!record) {
            return res.status(404).json({ msg: 'Pet record not found' });
        }

        record.title = title;
        record.subtitle = subtitle || '';
        record.category = category || 'Vaccination';
        record.date = date || '';
        record.notes = notes || '';

        if (req.file) {
            record.attachmentUrl = `/uploads/pet-records/${req.file.filename}`;
            record.attachmentName = req.file.originalname;
            record.attachmentMimeType = req.file.mimetype;
        } else if (attachmentUrl !== undefined) {
            record.attachmentUrl = attachmentUrl || '';
        }

        await pet.save();

        const updatedPet = await Pet.findById(pet._id)
            .populate('owner', 'name email phone')
            .populate('records.createdBy', 'name email');

        res.json(updatedPet);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.deletePet = async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({ msg: 'Pet not found' });
        }

        const isOwner = pet.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ msg: 'Not allowed to delete this pet' });
        }

        await pet.deleteOne();

        res.json({ msg: 'Pet deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
