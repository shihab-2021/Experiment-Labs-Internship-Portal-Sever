const express = require("express");
const userControllers = require("../../controllers/users.controller");

const router = express.Router();

router
  .route("/")
  .get(userControllers.getAnUserByEmail)
  .post(userControllers.saveAUser);

router.route("/addMember").put(userControllers.addUserToNewOrganization);

router
  .route("/usersByOrganization/:organizationId")
  .get(userControllers.getUsersByOrganization);

module.exports = router;