import { getBookingById } from '../models/bookings.js';

export default async (req, res) => {
    const { bookingId } = req.params;

    const booking = await getBookingById(bookingId);

    res.render('trips/confirm', {
        title: 'Trip booking',
        booking
    });
};
