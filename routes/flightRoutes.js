const express = require("express");
const flightController = require("../controllers/flightController");
const router = express.Router();

router
  .route("/:flightId/passengers/:email")
  .put(flightController.modifySeatPreference)
  .delete(flightController.cancelFlight);

router.route("/:flightId/passengers").get(flightController.viewPassengers);

router.route("/tickets/:email").get(flightController.viewFlightTicketDetails);

router.route("/book").post(flightController.bookFlight);

module.exports = router;
