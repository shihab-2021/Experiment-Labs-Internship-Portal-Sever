const express = require("express");
const categoryControllers = require("../../controllers/categories.controller");

const router = express.Router();

router
  .route("/")
  .post(categoryControllers.saveACategory)
  .get(categoryControllers.getAllCategories);

module.exports = router;
