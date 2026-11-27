// src/controllers/schedules.js
import { getSchedulesByTripId } from '../models/schedules.js';

export const getSchedulesForTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const schedules = await getSchedulesByTripId(id);

        if (!schedules) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        return res.status(200).json({ schedules });
    } catch (error) {
        console.error('Error fetching schedules:', error);

        return res.status(500).json({ message: 'Failed to fetch schedules' });
    }
};

export const getSchedulesForTripAndMonth = async (req, res) => {
    try {
        const { id } = req.params;
        const requestedMonth = Number(req.query.month);

        if (!Number.isInteger(requestedMonth) || requestedMonth < 1 || requestedMonth > 12) {
            return res.status(400).json({ message: 'Month must be a whole number from 1 to 12' });
        }

        const schedules = await getSchedulesByTripId(id, requestedMonth);

        if (!schedules) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        return res.status(200).json({ schedules });
    } catch (error) {
        console.error('Error fetching schedules:', error);

        return res.status(500).json({ message: 'Failed to fetch schedules' });
    }
};
