const express = require("express");
const taskSubmissionsController = require("../../controllers/taskSubmissions.controller");

const router = express.Router();

router.route("/").get(taskSubmissionsController.getAllTaskSubmissions);

router.route("/leaderBoard").get(taskSubmissionsController.generateLeaderBoard);

router
  .route("/leaderBoard/counsellorId/:counsellorId")
  .get(taskSubmissionsController.generateCounsellorLeaderBoard);

router
  .route("/leaderBoard/schoolId/:schoolId")
  .get(taskSubmissionsController.generateSchoolLeaderBoard);

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

///rakib's
router
  .route("/counsellorId/:counsellorId")
  .get(taskSubmissionsController.studentTasksByCounsellor);

router
  .route("/getCounsellorStats/counsellorId/:counsellorId")
  .get(taskSubmissionsController.getCounsellorStats);

router
  .route("/getSchoolsWithTasksAndOrganizations/counsellorId/:counsellorId")
  .get(taskSubmissionsController.getSchoolsWithTasksAndOrganizations);

router
  .route("/getSubmissionStatusByCounsellorId/counsellorId/:counsellorId")
  .get(taskSubmissionsController.getSubmissionStatusByCounsellorId);

module.exports = router;
