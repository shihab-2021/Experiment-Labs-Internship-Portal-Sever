const express = require("express");
const taskSubmissionsController = require("../../controllers/taskSubmissions.controller");

const router = express.Router();

router
  .route("/submissions/:participantEmail")
  .get(taskSubmissionsController.getSubmissionsByParticipantEmail);

router
  .route("/:submissionId")
  .get(taskSubmissionsController.getATaskSubmissionById);

module.exports = router;
