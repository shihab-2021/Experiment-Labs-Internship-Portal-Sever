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

router
  .route("/taskId/:taskId/taskStatus/:taskStatus")
  .put(tasksControllers.updateTaskStatus);

router.route("/taskStatus/:taskStatus").get(tasksControllers.getTasksByStatus);

router
  .route("/creatorEmail/:creatorEmail")
  .get(tasksControllers.getTasksByCreatorEmail);

router.route("/applyTask/:taskId").put(tasksControllers.applyForTask);

router.route("/submitTask").post(tasksControllers.submitATask);

router
  .route("/organizationId/:organizationId/creatorEmail/:creatorEmail")
  .get(tasksControllers.getTasksByOrganizationAndCreator);

module.exports = router;
