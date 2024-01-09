const express = require("express");
const emailController = require("../../controllers/email.controller");

const router = express.Router();

router.post('/send-bulk-emails', emailController.sendBulkEmails);
router.post('/single-email', emailController.sendAnEmail);

module.exports = router;
