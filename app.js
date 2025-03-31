const express = require("express");
const flightsRouter = require("./routes/flightRoutes");
const app = express();

app.use(express.json());
app.use("/api/v1/flights", flightsRouter);

module.exports = app;
