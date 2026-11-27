// src/models/schemas/schedules.js
import mongoose from 'mongoose';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const scheduleSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        tripId: { type: String, required: true, index: true, trim: true },
        departureTime: { type: String, required: true, match: timePattern },
        arrivalTime: { type: String, required: true, match: timePattern },
        daysOfWeek: {
            type: [{ type: String, enum: weekdays }],
            required: true,
            validate: (days) => days.length > 0,
        },
        status: { type: Boolean, required: true },
    },
    { timestamps: true },
);

const schedule = mongoose.model('Schedule', scheduleSchema);

export default schedule;
