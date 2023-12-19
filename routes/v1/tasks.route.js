const express = require("express");
const tasksControllers = require("../../controllers/tasks.controller");

const router = express.Router();

router
  .route("/")
  .get(tasksControllers.getAllTask)
  .post(tasksControllers.saveATask);

router
  .route("/:id")
  .get(tasksControllers.getATaskById)
  .delete(tasksControllers.deleteATask);

router
  .route("/organizationId/:organizationId/taskStatus/:taskStatus")
  .get(tasksControllers.getTasksByOrganizationAndStatus);

router.route("/taskStatus/:taskStatus").get(tasksControllers.getTasksByStatus);

router.route("/applyTask/:taskId").put(tasksControllers.applyForTask);

router.route("/submitTask").post(tasksControllers.submitATask);

module.exports = router;
