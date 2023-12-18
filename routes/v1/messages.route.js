const express = require("express");
const messageControllers = require("../../controllers/messages.controller");

const router = express.Router();

router
    .route("/")
    .post(messageControllers.sendMessage);

router
    .route("/chatId/:chatId")
    .get(messageControllers.getMessageByChatId);

module.exports = router;
