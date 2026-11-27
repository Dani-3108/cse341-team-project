// src/routes/api-routes.js
import { Router } from 'express';
import { getAllTrips, getTripById } from '../controllers/trips.js';

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

export default router;