// src/routes/api-routes.js
import { Router } from 'express';
import { getAllTrips, getTripById } from '../controllers/trips.js';
import { getSchedulesForTrip, getSchedulesForTripAndMonth } from '../controllers/schedules.js';

const router = Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: All trips, wrapped in a trips array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trips:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch trips
 */
router.get('/trips', getAllTrips);
/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get one trip by its id
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: alpine-panorama
 *         description: The slug id of the trip
 *     responses:
 *       200:
 *         description: The requested trip
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: No trip has that id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch trip
 */
router.get('/trips/:id', getTripById);

/**
 * @swagger
 * /api/trips/{id}/schedules:
 *   get:
 *     summary: Get the schedules of a trip, optionally for one month
 *     description: >
 *       Returns every schedule of the trip (active and inactive; check status).
 *       With the month query parameter, returns the schedules only if the trip
 *       operates in that month, otherwise an empty list.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: alpine-panorama
 *         description: The slug id of the trip
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         example: 5
 *         description: Month number (1-12)
 *     responses:
 *       200:
 *         description: The schedules, wrapped in a schedules array (can be empty)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       tripId:
 *                         type: string
 *                         example: alpine-panorama
 *                       departureTime:
 *                         type: string
 *                         example: "08:30"
 *                       arrivalTime:
 *                         type: string
 *                         example: "13:00"
 *                       daysOfWeek:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: [monday, friday]
 *                       status:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: The month is not a whole number from 1 to 12
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Month must be a whole number from 1 to 12
 *       404:
 *         description: No trip has that id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch schedules
 */
router.get('/trips/:id/schedules', (req, res) => {
    if (req.query.month === undefined) {
        return getSchedulesForTrip(req, res);
    }

    return getSchedulesForTripAndMonth(req, res);
});

export default router;