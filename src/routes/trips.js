import { bookingPage, processBookingRequest } from '../controllers/bookings.js';
import bookingDetailsPage from './confirm.js';
import { Router } from 'express';

const router = Router();

// Display booking form
router.get('/booking/:scheduleId', bookingPage);

// Create booking
router.post('/booking', processBookingRequest);

// Display completed booking
router.get('/booking/details/:bookingId', bookingDetailsPage);

export default router;