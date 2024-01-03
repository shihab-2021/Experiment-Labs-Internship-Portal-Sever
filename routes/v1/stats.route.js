const express = require("express");
const statControllers = require("../../controllers/stats.controller");

const router = express.Router();

router
    .route("/companiesTask")
    .get(statControllers.getStatsForCompaniesTask);


router
    .route("/studentSubmission")
    .get(statControllers.getStatsForStudentSubmission);


router
    .route("/companiesPostedTask")
    .get(statControllers.getStatsForCompaniesPostedTask);


router
    .route("/studentSubmissionTable")
    .get(statControllers.getStatsForStudentSubmissionTable);


router
    .route("/taskCategory/organizationId/:organizationId")
    .get(statControllers.getStatsOrganizationTaskCategory);


module.exports = router;
