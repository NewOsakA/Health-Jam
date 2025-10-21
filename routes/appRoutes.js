const express = require("express");
const router = express.Router();

// Import the specialized routers
const mainRoutes = require("./mainRoutes.js");
const authRoutes = require("./authRoutes.js");
const patientRoutes = require("./patientRoutes.js");
const doctorRoutes = require("./doctorRoutes.js");
const appointmentRoutes = require("./appointmentRoutes.js");
const requireLogin = require("../middleware/requireLogin");

router.use("/", mainRoutes);
router.use("/", authRoutes);
router.use("/patients", requireLogin, patientRoutes);
router.use("/doctors", requireLogin, doctorRoutes);
router.use("/appointments", requireLogin, appointmentRoutes);
router.use("/accounts", requireLogin, require("./accountRoutes.js"));

module.exports = router;
