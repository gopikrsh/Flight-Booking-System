const request = require('supertest');
const app = require('../app');

describe('DELETE /api/v1/flights/:flightId/passengers/:email', () => {
 
    it('should return 400 if no booking is found', async () => {
        const response = await request(app)
            .delete('/api/v1/flights/KF2053/passengers/manoj@example.com')
            .send({
                bookingDetails: {
                    bookingId: 'nonexistent',
                    passengerName: 'Manoj',
                    travelDate: '2023-10-01',
                    class_type: 'business',
                    seatNumber: '1A'
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe("Seat number does not exist or No booking found");
    });

    it('should return 400 if the booking has already been canceled', async () => {
        const response = await request(app)
            .delete('/api/v1/flights/KF2053/passengers/manoj@example.com')
            .send({
                bookingDetails: {
                    bookingId: '12345',
                    passengerName: 'Manoj',
                    travelDate: '2023-10-01',
                    class_type: 'business',
                    seatNumber: '1A'
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe(`Seat number does not exist or No booking found`);
    });

    it('should return 400 if seat allotment data is not found', async () => {
        const response = await request(app)
            .delete('/api/v1/flights/KF2053/passengers/manoj@example.com')
            .send({
                bookingDetails: {
                    bookingId: '12345',
                    passengerName: 'Manoj',
                    travelDate: '2023-10-01',
                    class_type: 'business',
                    seatNumber: '1A'
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe(`Seat number does not exist or No booking found`);
    });

    it('should return 400 if the seat number does not exist or is not booked', async () => {
        const response = await request(app)
            .delete('/api/v1/flights/KF2053/passengers/manoj@example.com')
            .send({
                bookingDetails: {
                    bookingId: '12345',
                    passengerName: 'Manoj',
                    travelDate: '2023-10-01',
                    class_type: 'business',
                    seatNumber: 'B2'
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe(`Seat number does not exist or No booking found`);
    });

        // it('should cancel a flight for a passenger', async () => {
    //     const response = await request(app)
    //         .delete('/api/v1/flights/KF2053/passengers/manoj@example.com')
    //         .send({
    //             bookingDetails: {
    //                 bookingId: '12345',
    //                 passengerName: 'Manoj',
    //                 travelDate: '2023-10-01',
    //                 class_type: 'business',
    //                 seatNumber: '1A'
    //             }
    //         });

    //     expect(response.status).toBe(200);
    //     expect(response.body.status).toBe('success');
    //     expect(response.body.message).toBe("Your flight has been successfully canceled");
    // });
});