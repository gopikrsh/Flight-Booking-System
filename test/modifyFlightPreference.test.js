const request = require('supertest');
const app = require('../app');

describe('PUT /api/v1/flights/:flightId/passengers/:email', () => {

    // it('should successfully modify the seat preference', async () => {
    //     const response = await request(app)
    //         .put('/api/v1/flights/KF2053/passengers/manoj@gmail.com')
    //         .send({
    //             newSeatPreference: 'B1',
    //             class_type: 'business',
    //             bookingId: 2
    //         });

    //     expect(response.status).toBe(200);
    //     expect(response.body.status).toBe('success');
    //     expect(response.body.data.booking.seatNumber).toBe('B1');
    //     expect(seatAllotmentData.seatAllotment[0].business_seat_numbers[0].status).toBe('available'); // Old seat should be available
    //     expect(seatAllotmentData.seatAllotment[0].business_seat_numbers[1].status).toBe('booked'); // New seat should be booked
    // });

    // it('should return 400 if required parameters are missing', async () => {
    //     const response = await request(app)
    //         .put('/api/v1/flights/KF2053/passengers/manoj@gmail.com')
    //         .send({
    //             newSeatPreference: 'B1'
    //             // Missing bookingId
    //         });

    //     expect(response.status).toBe(400);
    //     expect(response.body.status).toBe('failure');
    //     expect(response.body.message).toBe('Booking id and New seat perference are required');
    // });

    it('should return 400 if the booking is not found', async () => {
        const response = await request(app)
            .put('/api/v1/flights/KF2053/passengers/manoj@gmail.com')
            .send({
                newSeatPreference: '1B',
                class_type: 'business',
                bookingId: 'INVALID_ID'
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe('Booking details not found for the email: manoj@gmail.com and booking id: INVALID_ID');
    });

    it('should return 400 if the new seat preference is the same as the old seat allotment', async () => {
        const response = await request(app)
            .put('/api/v1/flights/KF2053/passengers/manoj@gmail.com')
            .send({
                newSeatPreference: 'B1', // Same as old seat
                class_type: 'business',
                bookingId: 2
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe('New seat preference is same as the old seat allotment');
    });

    it('should return 400 if the new seat is not available', async () => {
        const response = await request(app)
            .put('/api/v1/flights/KF2053/passengers/manoj@gmail.com')
            .send({
                newSeatPreference: 'E2', // Trying to book an already booked seat
                class_type: 'business',
                bookingId: '2'
            });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('failure');
        expect(response.body.message).toBe('The preferred seat number E2 is not available in the business class');
    });
});