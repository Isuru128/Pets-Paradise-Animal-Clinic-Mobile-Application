const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        petName: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
            default: 'Pending'
        }
    },
    { timestamps: true }
);

appointmentSchema.index(
    { date: 1, time: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ['Pending', 'Confirmed', 'Completed'] }
        }
    }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
