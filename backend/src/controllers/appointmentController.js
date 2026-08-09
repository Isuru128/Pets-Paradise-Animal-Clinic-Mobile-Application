const Appointment = require('../models/Appointment');

const appointmentStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const bookedAppointmentStatuses = ['Pending', 'Confirmed', 'Completed'];
const userCancellableStatuses = ['Pending', 'Confirmed'];
const clinicSessions = [
    { start: '09:00', end: '12:30' },
    { start: '17:00', end: '20:30' }
];

exports.createAppointment = async (req, res) => {
    try {
        const { petName, reason, date, time } = req.body;

        if (!petName || !reason || !date || !time) {
            return res.status(400).json({
                msg: 'Pet name, reason, date and time are required'
            });
        }

        const slotError = validateAppointmentSlot(date, time);

        if (slotError) {
            return res.status(400).json({ msg: slotError });
        }

        const existingAppointment = await Appointment.findOne({
            date,
            time,
            status: { $in: bookedAppointmentStatuses }
        });

        if (existingAppointment) {
            return res.status(400).json({ msg: 'This appointment slot is already booked' });
        }

        const appointment = await Appointment.create({
            user: req.user.id,
            petName: petName.trim(),
            reason: reason.trim(),
            date,
            time
        });

        res.status(201).json(appointment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ msg: 'This appointment slot is already booked' });
        }

        res.status(500).json({ msg: error.message });
    }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;

        if (!isValidDate(date)) {
            return res.status(400).json({ msg: 'Valid appointment date is required' });
        }

        const bookedAppointments = await Appointment.find({
            date,
            status: { $in: bookedAppointmentStatuses }
        }).select('time');
        const bookedTimes = new Set(bookedAppointments.map((appointment) => appointment.time));
        const slots = getClinicSlots()
            .filter((time) => !isPastSlot(date, time))
            .map((time) => ({
                time,
                available: !bookedTimes.has(time)
            }));

        res.json({ date, slots });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user.id })
            .sort({ date: 1, time: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.cancelMyAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        if (!userCancellableStatuses.includes(appointment.status)) {
            return res.status(400).json({ msg: 'Only pending or confirmed appointments can be cancelled' });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('user', 'name email phone')
            .sort({ date: 1, time: 1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!appointmentStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid appointment status' });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'name email phone');

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ msg: 'This appointment slot is already booked' });
        }

        res.status(500).json({ msg: error.message });
    }
};

function validateAppointmentSlot(date, time) {
    if (!isValidDate(date)) {
        return 'Valid appointment date is required';
    }

    if (!isValidTime(time)) {
        return 'Valid appointment time is required';
    }

    if (isPastDate(date)) {
        return 'Appointment date cannot be in the past';
    }

    if (!getClinicSlots().includes(time)) {
        return 'Appointment time must be within clinic sessions';
    }

    if (isPastSlot(date, time)) {
        return 'Appointment time cannot be in the past';
    }

    return '';
}

function getClinicSlots() {
    return clinicSessions.flatMap((session) => {
        const slots = [];
        let cursor = timeToMinutes(session.start);
        const end = timeToMinutes(session.end);

        while (cursor < end) {
            slots.push(minutesToTime(cursor));
            cursor += 15;
        }

        return slots;
    });
}

function isValidDate(value) {
    const text = String(value || '');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return false;
    }

    const date = new Date(`${text}T00:00:00`);

    return !Number.isNaN(date.getTime()) && text === minutesToDateString(date);
}

function isValidTime(value) {
    const text = String(value || '');

    if (!/^\d{2}:\d{2}$/.test(text)) {
        return false;
    }

    const [hours, minutes] = text.split(':').map(Number);

    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && minutes % 15 === 0;
}

function isPastDate(value) {
    const date = new Date(`${value}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return date < today;
}

function isPastSlot(date, time) {
    const slotDate = new Date(`${date}T${time}:00`);

    return slotDate < new Date();
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

function minutesToTime(value) {
    const hours = String(Math.floor(value / 60)).padStart(2, '0');
    const minutes = String(value % 60).padStart(2, '0');

    return `${hours}:${minutes}`;
}

function minutesToDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
