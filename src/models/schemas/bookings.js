import mongoose from 'mongoose';

const weekdays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

const passengerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        scheduleId: {
            type: Number,
            required: true
        },
        tripId: {
            type: String,
            required: true,
            trim: true
        },
        ticketClass: {
            type: String,
            required: true,
            trim: true
        },
        selectedDay: {
            type: String,
            required: true,
            enum: weekdays
        },
        passengers: {
            type: [passengerSchema],
            required: true,
            validate: (passengers) => passengers.length > 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { collection: 'bookings' }
);

const booking = mongoose.model('Booking', bookingSchema);

export default booking;