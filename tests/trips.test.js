import { afterEach, describe, expect, test, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { getDb } from '../src/db/connect.js';
import trip from '../src/models/schemas/trips.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/trips', () => {
  test('returns the trips from the starter data', async () => {
    const response = await request(app).get('/api/trips');

    expect(response.status).toBe(200);
    expect(response.body.trips).toHaveLength(6);
  });

  test('returns 200 with an empty list when there are no trips', async () => {
    await getDb().collection('trips').deleteMany({});

    const response = await request(app).get('/api/trips');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ trips: [] });
  });

  test('returns 500 with a safe message when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(trip, 'find').mockImplementation(() => ({
      lean: () => Promise.reject(new Error('database is down'))
    }));

    const response = await request(app).get('/api/trips');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Failed to fetch trips' });
  });
});

describe('GET /api/trips/:id', () => {
  test('returns one trip', async () => {
    const response = await request(app).get('/api/trips/alpine-panorama');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('alpine-panorama');
  });

  test('returns 404 for an unknown id', async () => {
    const response = await request(app).get('/api/trips/xyz');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Trip not found' });
  });
});
