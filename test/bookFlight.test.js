const request = require('supertest');
const app = require('../app');

describe('POST /api/v1/flights/book', () => {
 
    it('should successfully book a flight', async () => {
        const response = await request(app)
            .post('/api/v1/flights/book')
            .send({
                name: 'Manoj',
                address: '123 Main St',
                email: 'manoj@example.com',
                phone: '1234567890',
                destination: 'New york',
                flight_id: 'MR12653',
                travelDate: '2025-04-10',
                class_type: 'business',
                seatNumber: 'B1'
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Booking Confirmed');
        expect(response.body.bookingDetails.name).toBe('Manoj');
    });

    it('should return 400 if required parameters are missing', async () => {
        const response = await request(app)
            .post('/api/v1/flights/book')
            .send({
                name: 'Manoj',
                email: 'manoj@example.com',
                // Missing other required fields
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Missing parameters:');
    });

    it('should return 400 if the flight is not found', async () => {
        const response = await request(app)
            .post('/api/v1/flights/book')
            .send({
                name: 'Manoj',
                address: '123 Main St',
                email: 'manoj@example.com',
                phone: '1234567890',
                destination: 'Invalid Destination',
                flight_id: 'INVALID_FLIGHT',
                travelDate: '2023-10-01',
                class_type: 'business',
                seatNumber: '1A'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Flight not found, Please search with the different destination');
    });

    it('should return 400 if the class type is invalid', async () => {
        const response = await request(app)
            .post('/api/v1/flights/book')
            .send({
                name: 'Manoj',
                address: '123 Main St',
                email: 'manoj@example.com',
                phone: '1234567890',
                destination: 'New york',
                flight_id: 'KF2053',
                travelDate: '2023-10-01',
                class_type: 'invalid_class',
                seatNumber: '1A'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid class type');
    });
})