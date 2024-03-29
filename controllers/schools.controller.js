const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const schoolCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("schools");
const taskSubmissionCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("taskSubmissions");
const userCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("users");

module.exports.getSchoolsByCounsellorId = async (req, res, next) => {
  const { counsellorId } = req.params;
  const result = await schoolCollection.find({ counsellorId }).toArray();
  res.send(result);
};

module.exports.getASchoolById = async (req, res, next) => {
  const { schoolId } = req.params;
  const query = { _id: new ObjectId(schoolId) };
  const school = await schoolCollection.findOne(query);
  res.send(school);
};

module.exports.getSchoolStatisticalData = async (req, res, next) => {
  const { schoolId } = req.params;

  try {
    // Find unique tasks and organizations applied by students of the school
    const submissionsQuery = {
      schoolId,
    };

    const submissions = await taskSubmissionCollection
      .find(submissionsQuery)
      .toArray();

    const uniqueTaskIds = new Set();
    const uniqueOrganizationIds = new Set();
    const selectedSubmissions = [];
    const rejectedSubmissions = [];

    submissions.forEach((submission) => {
      uniqueTaskIds.add(submission.taskId);
      uniqueOrganizationIds.add(submission.organizationId);

      if (submission.submissionStatus === "Selected") {
        selectedSubmissions.push(submission);
      } else if (submission.submissionStatus === "Rejected") {
        rejectedSubmissions.push(submission);
      }
    });

    const uniqueTasksCount = uniqueTaskIds.size;
    const uniqueTaskIdsList = Array.from(uniqueTaskIds);
    const uniqueOrganizationsCount = uniqueOrganizationIds.size;
    const uniqueOrganizationIdsList = Array.from(uniqueOrganizationIds);

    const studentsQuery = {
      schoolId,
    };
    const students = await userCollection.find(studentsQuery).toArray();
    const totalStudentsCount = students.length;

    res.status(200).json({
      schoolId,
      uniqueTasksCount,
      // uniqueTaskIds: uniqueTaskIdsList,
      uniqueOrganizationsCount,
      // uniqueOrganizationIds: uniqueOrganizationIdsList,
      selectedSubmissionCount: selectedSubmissions.length,
      rejectedSubmissionCount: rejectedSubmissions.length,
      totalStudentsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
