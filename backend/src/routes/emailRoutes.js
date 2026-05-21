const express = require("express");
const router = express.Router();
const { parseEmail, processEmailEvents } = require("../controllers/emailController");

router.post("/parse", parseEmail);
router.get("/process", processEmailEvents);

module.exports = router;