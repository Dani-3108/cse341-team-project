import { getAllBookings as findAllBookings, createBooking } from '../models/bookings.js';
import { getDb } from '../db/connect.js';
import { generatebookingCode } from '../includes/helpers.js';
import { getScheduleById } from '../models/schedules.js';
import { getTripById } from '../models/trips.js';

export async function getAllBookings(req, res) {
    try {
        const bookings = await findAllBookings();

        return res.status(200).json({ bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ message: 'Failed to fetch bookings' });
    }
}

const bookingPage = async (req, res) => {
    const { scheduleId } = req.params;

    const db = getDb();
    const schedule = await getScheduleById(Number(scheduleId));

    if (!schedule) {
        return res.status(404).send('Schedule not found');
    }

    const trip = await getTripById(schedule.tripId);

    if (!trip) {
        return res.status(404).send('Trip not found');
    }
    const ticketClasses = await db.collection('ticketClasses').find({}).toArray();
    const ticketOptions = ticketClasses.map((ticketClass) => ({
        class: ticketClass.class,
        name: ticketClass.name,
        price: trip.distance * ticketClass.pricePerKm,
        amenities: ticketClass.amenities,
        description: ticketClass.description
    }));

    return res.render('trips/book', {
        title: 'Book Trip',
        schedule,
        ticketOptions
    });
};

const processBookingRequest = async (req, res) => {
    try {
        const booking = await createBooking({
            id: generatebookingCode(),
            scheduleId: Number(req.body.scheduleId),
            tripId: req.body.tripId,
            ticketClass: req.body.ticketClass,
            selectedDay: req.body.selectedDay,
            passengers: req.body.passengers
        });

        return res.redirect(`/trips/booking/${booking.id}`);
    } catch (error) {
        console.error('Error processing booking request:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Invalid booking information'
            });
        }

        return res.status(500).json({
            message: 'Failed to process booking request'
        });

        return res.redirect(`/trips/booking/details/${booking.id}`);
    }
};

export const bookingsAdminPage = (req, res) => {
    return res.render('bookings', {
        title: 'Bookings Admin'
    });
};

export { bookingPage, processBookingRequest };
    