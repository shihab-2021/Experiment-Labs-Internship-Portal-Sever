const express = require("express");
const statControllers = require("../../controllers/stats.controller");

const router = express.Router();

router
  .route("/companiesTask")
  .get(statControllers.getStatsForCompaniesTask);


router
  .route("/studentSubmission")
  .get(statControllers.getStatsForStudentSubmission);

module.exports = router;