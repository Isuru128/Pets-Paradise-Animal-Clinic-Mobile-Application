const mongoose = require('mongoose');

const petRecordSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        subtitle: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            enum: ['Checkup', 'Vaccination', 'Grooming', 'Treatment', 'Report', 'Other'],
            default: 'Vaccination'
        },
        date: {
            type: String,
            default: ''
        },
        notes: {
            type: String,
            default: ''
        },
        attachmentUrl: {
            type: String,
            default: ''
        },
        attachmentName: {
            type: String,
            default: ''
        },
        attachmentMimeType: {
            type: String,
            default: ''
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

const petSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        breed: {
            type: String,
            default: ''
        },
        age: {
            type: String,
            default: ''
        },
        birthday: {
            type: String,
            default: ''
        },
        gender: {
            type: String,
            default: ''
        },
        medicalNotes: {
            type: String,
            default: ''
        },
        imageUrl: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            default: 'Healthy'
        },
        records: [petRecordSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);
