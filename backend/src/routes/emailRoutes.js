const express = require("express");
const router = express.Router();
const { parseEmail, processEmailEvents } = require("../controllers/emailController");
const authMiddleware  = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/parse", parseEmail);
router.get("/process", authMiddleware, adminMiddleware, processEmailEvents);

module.exports = router;