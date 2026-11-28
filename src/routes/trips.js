import { bookingPage, processBookingRequest } from '../controllers/bookings.js';
import bookingDetailsPage from './confirm.js';
import { Router } from 'express';

const router = Router();

// Book ticket
router.get('/booking/:scheduleId', bookingPage);
router.post('/booking', processBookingRequest);

// Booking details page
router.get('/booking/details/:bookingId', bookingDetailsPage);

export default router;