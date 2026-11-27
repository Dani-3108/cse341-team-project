import { afterEach, describe, expect, test, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { getDb } from '../src/db/connect.js';
import schedule from '../src/models/schemas/schedules.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/trips/:id/schedules', () => {
  test('returns all schedules of a trip', async () => {
    const response = await request(app).get('/api/trips/alpine-panorama/schedules');

    expect(response.status).toBe(200);
    expect(response.body.schedules).toHaveLength(2);
    expect(response.body.schedules[0]).toMatchObject({ tripId: 'alpine-panorama' });
  });

  test('returns 200 with an empty list for a trip without schedules', async () => {
    await getDb().collection('schedules').deleteMany({ tripId: 'alpine-panorama' });

    const response = await request(app).get('/api/trips/alpine-panorama/schedules');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ schedules: [] });
  });

  test('returns 404 for an unknown trip', async () => {
    const response = await request(app).get('/api/trips/xyz/schedules');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Trip not found' });
  });

  test('returns 500 with a safe message when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(schedule, 'find').mockImplementation(() => ({
      sort: () => ({ lean: () => Promise.reject(new Error('database is down')) })
    }));

    const response = await request(app).get('/api/trips/alpine-panorama/schedules');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Failed to fetch schedules' });
  });
});

describe('GET /api/trips/:id/schedules?month=', () => {
  test('returns the schedules when the trip operates in that month', async () => {
    const response = await request(app).get('/api/trips/alpine-panorama/schedules?month=5');

    expect(response.status).toBe(200);
    expect(response.body.schedules).toHaveLength(2);
  });

  test('returns an empty list when the trip does not operate in that month', async () => {
    const response = await request(app).get('/api/trips/alpine-panorama/schedules?month=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ schedules: [] });
  });

  test.each(['abc', '0', '13', '5.5', ''])('returns 400 for month "%s"', async (month) => {
    const response = await request(app).get(`/api/trips/alpine-panorama/schedules?month=${month}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Month must be a whole number from 1 to 12' });
  });

  test('returns 404 for an unknown trip', async () => {
    const response = await request(app).get('/api/trips/xyz/schedules?month=5');

    expect(response.status).toBe(404);
  });
});
