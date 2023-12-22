const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const taskSubmissionCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("taskSubmissions");

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
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3); // Calculate date 3 months ago

    const query = {
      submissionStatus: "Selected",
      submissionDateTime: {
        $gte: threeMonthsAgo.toISOString(), // SubmissionDateTime should be greater than or equal to 3 months ago
        $lt: new Date().toISOString(), // SubmissionDateTime should be less than current date
      },
    };

    const tasks = await taskSubmissionCollection.find(query).toArray();

    if (tasks.length > 0) {
      res.status(200).json({ message: "Tasks found", tasks });
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
