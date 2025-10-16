const express = require("express");
const router = express.Router();

// Import the specialized routers
const mainRoutes = require("./mainRoutes.js");
const authRoutes = require("./authRoutes.js");
const patientRoutes = require("./patientRoutes.js");

router.use("/", mainRoutes);
router.use("/", authRoutes);
router.use("/patients", patientRoutes);

module.exports = router;
