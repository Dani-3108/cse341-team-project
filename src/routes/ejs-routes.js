// src/routes/ejs-routes.js
import { Router } from 'express';
import { listTripsPage, tripDetailsPage } from '../controllers/trips.js';
import { bookingsAdminPage } from '../controllers/bookings.js';


const router = Router();

router.get('/trips', listTripsPage);
router.get('/trips/:tripId', tripDetailsPage);
router.get('/bookings-admin', bookingsAdminPage);

export default router;
