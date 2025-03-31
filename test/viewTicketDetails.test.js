const request = require('supertest');
const app = require('../app');

describe('GET /api/v1/flights/tickets/:email', () => {
  
    it('should return booking details for a valid email', async () => {
        const response = await request(app)
            .get('/api/v1/flights/tickets/manoj@gmail.com');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.bookingDetails.length).toBe(1);
        expect(response.body.data.bookingDetails[0].email).toBe('manoj@gmail.com');
    });

    it('should return 200 with a message if no flights/ticket are found for the provided email', async () => {
        const response = await request(app)
            .get('/api/v1/flights/tickets/nonexistent@example.com');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Booking not found for the email nonexistent@example.com');
    });
});