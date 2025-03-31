const request = require('supertest');
const app = require('../app');

describe('GET /api/v1/flights/:flightId/passengers', () => {
  
    it('should return passengers for a valid flight ID', async () => {
        const response = await request(app)
            .get('/api/v1/flights/KF2053/passengers');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.flight_id).toBe('KF2053');
    });

    it('should return 404 if the flight ID is invalid', async () => {
        const response = await request(app)
            .get('/api/v1/flights/INVALID_ID/passengers');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe('Invalid flight Id');
    });

    it('should return 404 if no passengers are found for a valid flight ID', async () => {
    
        const response = await request(app)
            .get('/api/v1/flights/KF1243/passengers');

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe('No passengers found');
    });
});
