const express = require("express");
const taskSubmissionsController = require("../../controllers/taskSubmissions.controller");

const router = express.Router();

router.route("/").get(taskSubmissionsController.getAllTaskSubmissions);

router.route("/leaderBoard").get(taskSubmissionsController.generateLeaderBoard);

router
  .route("/submissionStatus/:submissionStatus")
  .get(taskSubmissionsController.getTaskSubmissionsBySubmissionStatus);

router
  .route("/submissionId/:submissionId/submissionStatus/:submissionStatus")
  .put(taskSubmissionsController.updateSubmissionStatus);

router
  .route("/submissions/:participantEmail")
  .get(taskSubmissionsController.getSubmissionsByParticipantEmail);

router
  .route("/:submissionId")
  .get(taskSubmissionsController.getATaskSubmissionById);

module.exports = router;
