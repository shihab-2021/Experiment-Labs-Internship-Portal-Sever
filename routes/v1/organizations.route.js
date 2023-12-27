const express = require("express");
const organizationControllers = require("../../controllers/organizations.controller");

const router = express.Router();

router
  .route("/")
  .post(organizationControllers.createAnOrganization)
  .get(organizationControllers.getAllOrganizations);

router
  .route("/:id")
  .get(organizationControllers.getAnOrganization)
  .put(organizationControllers.updateAnOrganization);

module.exports = router;
