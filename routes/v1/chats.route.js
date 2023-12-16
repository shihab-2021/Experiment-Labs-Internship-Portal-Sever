const express = require("express");
const chatControllers = require("../../controllers/chats.controller");

const router = express.Router();

router
  .route("/")
  .post(chatControllers.createChat);

router
  .route("/userId/:userId")
  .get(chatControllers.getChatByUserId);

module.exports = router;
