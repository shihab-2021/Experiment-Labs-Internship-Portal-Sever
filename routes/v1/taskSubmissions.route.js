const express = require("express");
const taskSubmissionsController = require("../../controllers/taskSubmissions.controller");

const router = express.Router();

router
  .route("/submissions/:participantEmail")
  .get(taskSubmissionsController.getSubmissionsByParticipantEmail);

module.exports = router;
