const fs = require("fs");
const path = require("path");

const flightsDataPath = path.join(
  `__dirname/../`,
  "data",
  "flight-details.json"
);
const bookingsDataPath = path.join(
  `__dirname/../`,
  "data",
  "booking-details.json"
);
const seatsDataPath = path.join(`__dirname/../`, "data", "seat-allotment.json");

const flightsData = JSON.parse(fs.readFileSync(flightsDataPath));
const bookingsData = JSON.parse(fs.readFileSync(bookingsDataPath));
const seatAllotmentData = JSON.parse(fs.readFileSync(seatsDataPath));

exports.viewPassengers = async (req, res) => {
  try {
    const { flightId } = req.params;
    const flight = flightsData["flights"].find(
      (flight) => flight.flight_id === flightId
    );
    const passengers = bookingsData["bookings"].filter(
      (booking) => booking.flightId === flightId
    );

    if (!flight) {
      return res
        .status(404)
        .json({ status: "failure", message: "Invalid flight Id" });
    }
    if (!passengers.length) {
      return res
        .status(404)
        .json({ status: "failure", message: `No passengers found` });
    }
    return res.status(200).json({
      status: "success",
      results: passengers.length,
      data: {
        ...flight,
        passengers,
      },
    });
  } catch (error) {
    console.error("Error retrieving booking details:", error);
    return res
      .status(500)
      .json({
        status: "failure",
        message:
          "An error occured during fetching the booking details, Please try again later",
      });
  }
};

exports.modifySeatPreference = async (req, res) => {
  try {
    const { flightId, email } = req.params;
    const { newSeatPreference, class_type, bookingId } = req.body;

    if (!newSeatPreference || !bookingId) {
      res
        .status(400)
        .json({
          status: "failure",
          message: "Booking id and New seat perference are required",
        });
    }

    const booking = bookingsData["bookings"].find(
      (booking) =>
        booking.flightId === flightId &&
        booking.email === email &&
        booking.bookingId == bookingId
    );

    if (!booking) {
      res
        .status(400)
        .json({
          status: "failure",
          message: `Booking details not found for the email: ${email} and booking id: ${bookingId}`,
        });
    }

    const seatAssignment = seatAllotmentData.seatAllotment.find(
      (flight) => flight.flight_id == flightId
    );
    let oldSeatAllotment = seatAssignment[
      booking["class_type"] === "business"
        ? "business_seat_numbers"
        : "economy_seat_numbers"
    ].find((seat) => seat.seatNumber == booking.seatNumber);
    let newSeatAllotment = seatAssignment[
      class_type === "business"
        ? "business_seat_numbers"
        : "economy_seat_numbers"
    ].find((seat) => seat.seatNumber == newSeatPreference);

    if (oldSeatAllotment.seatNumber === newSeatPreference) {
      res
        .status(400)
        .json({
          status: "failure",
          message: "New seat preference is same as the old seat allotment",
        });
    } else {
      oldSeatAllotment.status = "available";
      oldSeatAllotment.passenger = null;

      if (!newSeatAllotment) {
        res
          .status(400)
          .json({
            status: "failure",
            message: `The preferred seat number ${newSeatPreference} is not available in the ${class_type} class`,
          });
      } else {
        newSeatAllotment.status = "booked";
        newSeatAllotment.passenger = {
          name: booking.name,
          email: booking.email,
          bookingId: booking.bookingId,
        };
        booking.seatNumber = newSeatPreference;
        booking.class_type = class_type;

        fs.writeFile(
          bookingsDataPath,
          JSON.stringify(bookingsData, null, 2),
          "utf-8",
          (err) => {
            if (err) {
              console.log("Error while updating the bookings data file", err);
            }
          }
        );

        fs.writeFile(
          seatsDataPath,
          JSON.stringify(seatAllotmentData, null, 2),
          "utf-8",
          (err) => {
            if (err) {
              console.log("Error while updating the bookings data file", err);
            }
          }
        );
        return res.status(200).json({
          status: "success",
          data: {
            booking,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error retrieving booking details:", error);
  }
};

exports.cancelFlight = async (req, res) => {
  try {
    const { email, flightId } = req.params;
    const { bookingDetails } = req.body;

    if (!email || !bookingDetails || !bookingDetails.bookingId) {
      res
        .status(400)
        .json({
          status: "failure",
          message: "Email and flight details are required",
        });
    }

    const booking = bookingsData["bookings"].find(
      (book) =>
        book.flightId === flightId &&
        book.bookingId === bookingDetails.bookingId &&
        book.email == email &&
        book.name == bookingDetails.passengerName &&
        book.travelDate == bookingDetails.travelDate
    );

    const flightSeatAllotment = seatAllotmentData.seatAllotment.find(
      (seat) => seat.flight_id === flightId
    );
    if (!flightSeatAllotment) {
      return res
        .status(400)
        .json({
          status: "failure",
          message: "Seat allotment data not found for this flight",
        });
    }

    const updateflightsData = flightsData.flights.find(
      (flight) => flight.flight_id === flightId
    );

    const seatToBook = flightSeatAllotment[
      bookingDetails.class_type === "business"
        ? "business_seat_numbers"
        : "economy_seat_numbers"
    ].find((seat) => seat.seatNumber === bookingDetails.seatNumber);
    if (!seatToBook || seatToBook.status !== "booked") {
      return res
        .status(400)
        .json({
          status: "failure",
          message: `Seat number does not exist or No booking found`,
        });
    }

    if (!booking) {
      return res
        .status(404)
        .json({ status: "failure", message: `No bookings found` });
    }

    if (booking.status === "canceled") {
      return res
        .status(400)
        .json({
          status: "failure",
          message: "The booking has already been canceled",
        });
    }

    booking.status = "canceled";
    seatToBook.status = "available";
    seatToBook.passenger = null;
    updateflightsData[
      bookingDetails.class_type === "business"
        ? "available_seats_business"
        : "available_seats_economy"
    ] += 1;

    fs.writeFile(
      bookingsDataPath,
      JSON.stringify(bookingsData, null, 2),
      "utf-8",
      (err) => {
        if (err) {
          console.log("Error while updating the bookings data file", err);
        }
      }
    );

    fs.writeFile(
      seatsDataPath,
      JSON.stringify(seatAllotmentData, null, 2),
      "utf-8",
      (err) => {
        if (err) {
          console.log("Error while updating the seat allotment data file", err);
        }
      }
    );

    fs.writeFile(
      flightsDataPath,
      JSON.stringify(flightsData, null, 2),
      "utf-8",
      (err) => {
        if (err) {
          console.log("Error while updating the flight-details data file", err);
        }
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Your flight has been successfully canceled",
    });
  } catch (error) {
    console.error("Error retrieving booking details:", error);
    return res
      .status(500)
      .json({
        status: "failure",
        message:
          "An error occured during fetching the booking details, Please try again later",
      });
  }
};

exports.viewFlightTicketDetails = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res
        .status(404)
        .json({ status: "failure", message: "Email address is required" });
    }
    const bookingDetails = bookingsData["bookings"].filter(
      (booking) => booking.email === email
    );

    if (!bookingDetails.length) {
      return res
        .status(200)
        .json({
          status: "success",
          message: `Booking not found for the email ${email}`,
        });
    }

    return res.status(200).json({
      status: "success",
      data: {
        bookingDetails,
      },
    });
  } catch (error) {
    console.error("Error retrieving booking details:", error);
    return res
      .status(500)
      .json({
        error:
          "An error occured during fetching the booking details, Please try again later",
      });
  }
};

exports.bookFlight = async (req, res) => {
  const reqBodyParams = [
    "name",
    "address",
    "email",
    "phone",
    "destination",
    "flight_id",
    "travelDate",
    "class_type",
    "seatNumber",
  ];
  const validateParams = reqBodyParams.filter((param) => !req.body[param]);

  if (validateParams.length > 0) {
    return res
      .status(400)
      .json({ error: `Missing parameters: ${validateParams}` });
  }

  const {
    name,
    address,
    email,
    phone,
    flight_id,
    destination,
    travelDate,
    class_type,
    seatNumber,
  } = req.body;

  try {
    const seatMapping = {
      business: "available_seats_business",
      economy: "available_seats_economy",
    };

    if (!seatMapping[class_type]) {
      return res.status(400).json({ error: "Invalid class type" });
    }

    const flight = flightsData["flights"].find(
      (flight) =>
        flight.flight_id === flight_id &&
        flight.destination === destination &&
        flight.departure_time.startsWith(travelDate)
    );
    if (!flight)
      return res
        .status(400)
        .json({
          error:
            "Flight not found, Please search with the different destination",
        });

    const flightSeatAllotment = seatAllotmentData.seatAllotment.find(
      (seat) => seat.flight_id === flight.flight_id
    );
    if (!flightSeatAllotment) {
      return res
        .status(400)
        .json({ error: "Seat allotment data not found for this flight" });
    }

    const seatToBook = flightSeatAllotment[
      class_type === "business"
        ? "business_seat_numbers"
        : "economy_seat_numbers"
    ].find((seat) => seat.seatNumber === seatNumber);
    if (!seatToBook || seatToBook.status !== "available") {
      return res
        .status(400)
        .json({ error: "Seat already booked or does not exist" });
    }

    const availableSeats = flight[seatMapping[class_type]];
    if (availableSeats > 0) {
      flight[seatMapping[class_type]] -= 1;

      const bookingDetails = {
        bookingId: bookingsData["bookings"].length + 1,
        name,
        address,
        email,
        phone,
        flightId: flight.flight_id,
        flightNumber: flight.flight_number,
        seatNumber,
        destination,
        travelDate,
        class_type,
        terminalNo: flight.terminal,
        status: "booked",
      };
      seatToBook.status = "booked";
      seatToBook.passenger = {
        name,
        email,
        bookingId: bookingDetails.bookingId,
      };

      bookingsData["bookings"].push(bookingDetails);

      fs.writeFile(
        flightsDataPath,
        JSON.stringify(flightsData, null, 2),
        "utf-8",
        (err) => {
          if (err) {
            console.log("Error while updating the flights data file", err);
          }
        }
      );

      fs.writeFile(
        bookingsDataPath,
        JSON.stringify(bookingsData, null, 2),
        "utf-8",
        (err) => {
          if (err) {
            console.log("Error while updating the bookings data file", err);
          }
        }
      );

      fs.writeFile(
        seatsDataPath,
        JSON.stringify(seatAllotmentData, null, 2),
        "utf-8",
        (err) => {
          if (err) {
            console.log("Error while updating the bookings data file", err);
          }
        }
      );

      return res.status(200).json({
        status: "success",
        message: "Booking Confirmed",
        bookingDetails,
      });
    } else {
      return res
        .status(400)
        .json({ message: "No seats available seats in the selected class" });
    }
  } catch (error) {
    console.error(`Error during booking process ${error}`);
    return res
      .status(500)
      .json({
        error:
          "An error occured during the booking process, Please try again later",
      });
  }
};
