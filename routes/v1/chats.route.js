const express = require("express");
const chatControllers = require("../../controllers/chats.controller");

const router = express.Router();

router
  .route("/")
  .post(chatControllers.createChat);

module.exports = router;
