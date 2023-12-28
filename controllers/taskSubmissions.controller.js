const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const taskSubmissionCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("taskSubmissions");
const taskCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("tasks");

module.exports.getSubmissionsByParticipantEmail = async (req, res, next) => {
  const participantEmail = req.params.participantEmail;

  try {
    const submissions = await taskSubmissionCollection
      .find({ participantEmail })
      .toArray();

    res.status(200).json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllTaskSubmissions = async (req, res, next) => {
  const result = await taskSubmissionCollection.find({}).toArray();
  res.send(result);
};

module.exports.getATaskSubmissionById = async (req, res, next) => {
  const { submissionId } = req.params;
  const query = { _id: new ObjectId(submissionId) };
  const user = await taskSubmissionCollection.findOne(query);
  res.send(user);
};

module.exports.getTaskSubmissionsBySubmissionStatus = async (
  req,
  res,
  next
) => {
  try {
    const { submissionStatus } = req.params;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3); // Calculate date 3 months ago

    const query = {
      submissionStatus, // Use the submissionStatus from params
      submissionDateTime: {
        $gte: threeMonthsAgo.toISOString(), // SubmissionDateTime should be greater than or equal to 3 months ago
        $lt: new Date().toISOString(), // SubmissionDateTime should be less than current date
      },
    };

    const tasks = await taskSubmissionCollection.find(query).toArray();

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

module.exports.updateSubmissionStatus = async (req, res, next) => {
  const { submissionId, submissionStatus } = req.params;

  try {
    const query = { _id: ObjectId(submissionId) };
    const update = { $set: { submissionStatus } };

    const result = await taskSubmissionCollection.updateOne(query, update);

    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ message: "Submission status updated successfully" });
    } else {
      res.status(404).json({ message: "Submission not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.generateLeaderBoard = async (req, res, next) => {
  try {
    // Fetch submissions within the last three months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const submissionsQuery = {
      submissionDateTime: {
        $gte: threeMonthsAgo.toISOString(),
        $lt: new Date().toISOString(),
      },
      submissionStatus: "Selected",
    };

    const submissions = await taskSubmissionCollection
      .find(submissionsQuery)
      .toArray();

    // Calculate work hours for each participant
    const participantWorkHours = {};

    await Promise.all(
      submissions.map(async (submission) => {
        const task = await taskCollection.findOne({
          _id: new ObjectId(submission?.taskId),
        });

        const taskTime = task ? parseInt(task.taskTime) : 0;
        const participantEmail = submission.participantEmail;

        if (!participantWorkHours[participantEmail]) {
          participantWorkHours[participantEmail] = 0;
        }
        participantWorkHours[participantEmail] += taskTime;
      })
    );

    const sortedParticipants = Object.entries(participantWorkHours)
      .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
      .map(([email, hours]) => ({ email, hours }));

    // Retrieve user information from the 'users' collection
    const userCollection = client
      .db("ExperimentLabsInternshipPortal")
      .collection("users");
    const usersInfo = await userCollection
      .find({ email: { $in: sortedParticipants.map((p) => p.email) } })
      .toArray();

    // Merge user information with sortedParticipants array
    const finalResult = sortedParticipants.map((participant) => {
      const userInfo = usersInfo.find(
        (user) => user.email === participant.email
      );
      return { ...participant, ...userInfo };
    });

    res.status(200).json(finalResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
