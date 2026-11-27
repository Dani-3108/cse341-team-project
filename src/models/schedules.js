// src/models/schedules.js
import schedule from './schemas/schedules.js';
import { getTripById } from './trips.js';

// Returns null when the trip does not exist, [] when it has no schedules
// (or does not operate in the requested month), otherwise the schedules.
export const getSchedulesByTripId = async (tripId, month) => {
    const foundTrip = await getTripById(tripId);

    if (!foundTrip) {
        return null;
    }

    if (month !== undefined && !foundTrip.operatingMonths.includes(month)) {
        return [];
    }

    return schedule.find({ tripId }).sort({ departureTime: 1 }).lean();
};
