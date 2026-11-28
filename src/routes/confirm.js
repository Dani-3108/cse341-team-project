import { getBookingById } from '../models/bookings.js';

export default async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const booking = await getBookingById(bookingId);
        if (!booking) {
            const notFoundError = new Error('Booking not found');
            notFoundError.status = 404;
            return next(notFoundError);
        }
        return res.render('trips/confirm', { title: 'Trip booking', booking });
    } catch (error) {
        return next(error);
    }
};
