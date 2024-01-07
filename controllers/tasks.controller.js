const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const taskCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("tasks");
const taskSubmissionCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("taskSubmissions");

module.exports.saveATask = async (req, res, next) => {
  const task = req.body;
  const result = await taskCollection.insertOne(task);
  res.send(result);
};

module.exports.getATaskById = async (req, res, next) => {
  const { id } = req.params;
  const query = { _id: new ObjectId(id) };
  const user = await taskCollection.findOne(query);
  res.send(user);
};

module.exports.getTasksByOrganizationAndStatus = async (req, res, next) => {
  const { organizationId, taskStatus } = req.params;

  // Construct the query based on organizationId and taskStatus
  const query = {
    "creator.organizationId": organizationId,
    taskStatus: taskStatus, // Assuming taskStatus is a string field in the document
  };

  const tasks = await taskCollection.find(query).toArray();
  res.send(tasks);
};

module.exports.getTasksByStatus = async (req, res, next) => {
  const { taskStatus } = req.params;

  // Construct the query based on organizationId and taskStatus
  const query = {
    taskStatus: taskStatus, // Assuming taskStatus is a string field in the document
  };

  const tasks = await taskCollection.find(query).toArray();
  res.send(tasks);
};

module.exports.getAllTask = async (req, res, next) => {
  const result = await taskCollection.find({}).toArray();
  res.send(result);
};

module.exports.deleteATask = async (req, res, next) => {
  const { id } = req.params;
  const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

module.exports.applyForTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { participantEmail, applyDateTime, organizationId } = req.body;

  try {
    const taskQuery = { _id: ObjectId(taskId) };
    const task = await taskCollection.findOne(taskQuery);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if participants array exists, if not, create it
    if (!task.participants) {
      task.participants = [];
    }

    // Check if participant has already applied
    const participantAlreadyApplied = task.participants.some(
      (participant) => participant.participantEmail === participantEmail
    );

    if (participantAlreadyApplied) {
      return res
        .status(400)
        .json({ message: "Participant has already applied for this task" });
    }

    const insertedSubmission = await taskSubmissionCollection.insertOne({
      taskId: taskId,
      ...req.body,
    });

    // Add participant application to the task
    const participantInfo = {
      participantEmail,
      applyDateTime,
      submissionId: String(insertedSubmission.insertedId),
    };

    task.participants.push(participantInfo);

    // Update task with the new participant application
    await taskCollection.updateOne(taskQuery, {
      $set: { participants: task.participants },
    });

    res
      .status(200)
      .json({ message: "Participant applied for the task successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.submitATask = async (req, res, next) => {
  const newSubmission = req.body;

  try {
    const query = {
      taskId: newSubmission.taskId,
      participantEmail: newSubmission.participantEmail,
    };

    let existingSubmission = await taskSubmissionCollection.findOne(query);

    // If there's no existing submission, create a new one
    if (!existingSubmission) {
      const insertedSubmission = await taskSubmissionCollection.insertOne(
        newSubmission
      );
      existingSubmission = { _id: insertedSubmission.insertedId };
    } else {
      // Update existing submission details
      await taskSubmissionCollection.updateOne(query, {
        $set: {
          aboutSolution: newSubmission.aboutSolution,
          fileLink: newSubmission.fileLink,
          submissionDateTime: newSubmission.submissionDateTime,
          submissionStatus: newSubmission.submissionStatus,
        },
      });
    }

    const taskQuery = { _id: ObjectId(newSubmission.taskId) };
    const task = await taskCollection.findOne(taskQuery);

    if (task) {
      const participantIndex = task.participants?.findIndex(
        (participant) =>
          participant.participantEmail === newSubmission.participantEmail
      );

      if (participantIndex !== -1) {
        // Add submissionId and submissionDateTime to the participant object
        task.participants[participantIndex].submissionId = String(
          existingSubmission._id
        ); // Convert ObjectId to string
        task.participants[participantIndex].submissionDateTime =
          newSubmission.submissionDateTime;

        // Update task with the new submission details
        await taskCollection.updateOne(taskQuery, {
          $set: { participants: task.participants },
        });

        return res
          .status(200)
          .json({ message: "Submission handled successfully" });
      }
    }

    return res.status(400).json({
      message: "Participant must apply for the task before submitting",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateTaskStatus = async (req, res, next) => {
  const { taskId, taskStatus } = req.params;
  const newData = req.body;

  try {
    const query = { _id: ObjectId(taskId) };
    const update = { $set: { taskStatus }, $addToSet: {} };

    // Add new data from the request body to the task
    for (const key in newData) {
      update.$set[key] = newData[key];
    }

    const result = await taskCollection.updateOne(query, update);

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Task updated successfully" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getTasksByOrganizationAndCreator = async (req, res, next) => {
  const { organizationId, creatorEmail } = req.params;

  try {
    const query = {
      "creator.email": creatorEmail,
      "creator.organizationId": organizationId,
    };

    const tasks = await taskCollection.find(query).toArray();

    if (tasks.length > 0) {
      res.status(200).json(tasks);
    } else {
      res.status(404).json({ message: "No tasks found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getTasksByCreatorEmail = async (req, res, next) => {
  const { creatorEmail } = req.params;

  try {
    const query = {
      "creator.email": creatorEmail,
    };

    const tasks = await taskCollection.find(query).toArray();

    if (tasks.length > 0) {
      res.status(200).json(tasks);
    } else {
      res.status(404).json({ message: "No tasks found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
