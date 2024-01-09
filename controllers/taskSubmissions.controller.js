const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const taskSubmissionCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("taskSubmissions");
const taskCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("tasks");
const userCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("users");
const schoolCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("schools");
const orgCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("organizations");

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
  const { suggestion, comment } = req.body;

  try {
    const query = { _id: ObjectId(submissionId) };
    const update = { $set: { submissionStatus } };

    if (submissionStatus === "Rejected" && (suggestion || comment)) {
      update.$set.suggestion = suggestion;
      update.$set.comment = comment;
    }

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

module.exports.generateCounsellorLeaderBoard = async (req, res, next) => {
  const { counsellorId } = req.params;

  try {
    // Fetch submissions for students under the given counsellor within the last three months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const submissionsQuery = {
      counsellorId,
      submissionDateTime: {
        $gte: threeMonthsAgo.toISOString(),
        $lt: new Date().toISOString(),
      },
      submissionStatus: "Selected",
    };

    const submissions = await taskSubmissionCollection
      .find(submissionsQuery)
      .toArray();

    // Calculate work hours for each student
    const studentWorkHours = {};

    await Promise.all(
      submissions.map(async (submission) => {
        const task = await taskCollection.findOne({
          _id: new ObjectId(submission?.taskId),
        });

        const taskTime = task ? parseInt(task.taskTime) : 0;
        const participantEmail = submission.participantEmail;

        if (!studentWorkHours[participantEmail]) {
          studentWorkHours[participantEmail] = 0;
        }
        studentWorkHours[participantEmail] += taskTime;
      })
    );

    const sortedParticipants = Object.entries(studentWorkHours)
      .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
      .map(([email, hours]) => ({ email, hours }));

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

module.exports.studentTasksByCounsellor = async (req, res, next) => {
  try {
    const { counsellorId } = req.params; // Extract the counsellorId from the request params

    // Find all users with the given counsellorId
    const users = await userCollection.find({ counsellorId }).toArray();

    // For each user, find their task submissions using the email
    const taskSubmissions = await Promise.all(
      users.map(async (user) => {
        const { email } = user;
        const { schoolId } = user;

        // Find task submissions for the user using their email
        const userTaskSubmissions = await taskSubmissionCollection
          .find({ participantEmail: email })
          .toArray();
        const schoolData = await schoolCollection.findOne({
          _id: new ObjectId(schoolId),
        });

        return {
          user,
          schoolData,
          taskSubmissions: userTaskSubmissions,
        };
      })
    );

    res.json(taskSubmissions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch task submissions for users" });
  }
};

module.exports.getCounsellorStats = async (req, res) => {
  try {
    const { counsellorId } = req.params;

    // 1. Get all users with the specified counsellorId
    const users = await userCollection.find({ counsellorId }).toArray();
    const userEmails = users.map((user) => user.email);

    // 2. Total Students (count of users)
    const totalStudents = users.length;

    // 3. Total Schools (count of distinct schools associated with the users)
    const schools = await schoolCollection.countDocuments({ counsellorId });

    // 4. Fetch all task submissions by participant email
    const taskSubmissions = await taskSubmissionCollection
      .find({ participantEmail: { $in: userEmails } })
      .toArray();

    // 5. Total Companies (distinct organizationIds from task submissions)
    const totalCompanies = new Set(
      taskSubmissions.map((submission) => submission.organizationId)
    ).size;

    // 6. Total Tasks (distinct taskIds from task submissions)
    const totalTasks = new Set(
      taskSubmissions.map((submission) => submission.taskId)
    ).size;

    res.json({
      totalStudents,
      totalSchools: schools,
      totalCompanies,
      totalTasks,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch counsellor statistics" });
  }
};

module.exports.getSchoolsWithTasksAndOrganizations = async (req, res) => {
  const { counsellorId } = req.params;

  try {
    // Fetch schools under the same counsellorId
    const schools = await schoolCollection.find({ counsellorId }).toArray();
    const schoolsWithDetails = await Promise.all(
      schools.map(async (school) => {
        // Find users under the school
        const users = await userCollection
          .find({ schoolId: school._id.toString() })
          .toArray();
        const userEmails = users.map((user) => user.email);



        // Find task submissions by participant emails
        const taskSubmissions = await taskSubmissionCollection
          .find({ participantEmail: { $in: userEmails } })
          .toArray();


        // Extract taskIds and organizationIds from task submissions
        const taskIds = taskSubmissions.map((submission) =>
          submission.taskId.toString()
        );
        const organizationIds = taskSubmissions.map((submission) =>
          submission.organizationId.toString()
        );

        // Find tasks and organizations using extracted IDs
        const tasks = await taskCollection
          .find({ _id: { $in: taskIds.map((id) => new ObjectId(id)) } })
          .toArray();
        const organizations = await orgCollection
          .find({ _id: { $in: organizationIds.map((id) => new ObjectId(id)) } })
          .toArray();
        const students = await userCollection
          .find({ email: { $in: userEmails.map((email) => email) } })
          .toArray();

        return {
          school,
          students,
          tasks,
          organizations,
        };
      })
    );

    res.json(schoolsWithDetails);
  } catch (error) {

    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch schools with tasks and organizations' });
  }
};


module.exports.getSubmissionStatusByCounsellorId = async (req, res) => {
  const { counsellorId } = req.params;

  try {
    const totalStudents = await userCollection.countDocuments({ counsellorId });
    const submissionStatusCounts = await taskSubmissionCollection.aggregate([
      { $match: { counsellorId } }, // Match submissions with the given counsellorId
      {
        $group: {
          _id: '$submissionStatus', // Group by submissionStatus field
          count: { $sum: 1 }, // Count occurrences of each status
          submissions: { $push: '$$ROOT' }
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field from the result
          submissionStatus: '$_id', // Rename _id as submissionStatus
          count: 1, // Include the count field in the result
          submissions: 1,
        },
      },
    ]).toArray();

    res.json({ totalStudents, submissionStatusCounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submission status counts' });
  }
};
