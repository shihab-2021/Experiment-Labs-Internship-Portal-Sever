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
