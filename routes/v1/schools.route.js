const express = require("express");
const schoolControllers = require("../../controllers/schools.controller");

const router = express.Router();

router.route("/schoolId/:schoolId").get(schoolControllers.getASchoolById);

router
  .route("/statisticalData/schoolId/:schoolId")
  .get(schoolControllers.getSchoolStatisticalData);

router
  .route("/counsellorId/:counsellorId")
  .get(schoolControllers.getSchoolsByCounsellorId);

module.exports = router;
