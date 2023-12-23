const express = require("express");
const userControllers = require("../../controllers/users.controller");

const router = express.Router();

router
  .route("/")
  .get(userControllers.getAnUserByEmail)
  .post(userControllers.saveAUser);

router
  .route("/:id")
  .get(userControllers.getAnUserById)
  .patch(userControllers.updateUserById);

router.route("/addMember").put(userControllers.addUserToNewOrganization);

router
  .route("/usersByOrganization/:organizationId")
  .get(userControllers.getUsersByOrganization);

router.route("/:id").get(userControllers.getUserById);

router
  .route("/userId/:userId/organizationId/:organizationId")
  .put(userControllers.removeMemberFromOrganization);

module.exports = router;
