const express = require("express");
const router = express.Router();

// Import the specialized routers
const mainRoutes = require("./mainRoutes.js");
const authRoutes = require("./authRoutes.js");
const patientRoutes = require("./patientRoutes.js");
const doctorRoutes = require("./doctorRoutes.js");
const requireAdmin = require("../middleware/requireAdmin");

router.use("/", mainRoutes);
router.use("/", authRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/accounts", requireAdmin, require("./accountRoutes.js"));

module.exports = router;
