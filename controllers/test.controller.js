const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
// const testCollection = client.db("fhi-tool").collection("test");
// const admin = require('firebase-admin');
// const serviceAccount = require('../serviceAccountKey.json'); // Path to your service account key JSON file

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // Other optional configurations
// });
const taskSubmissionCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("taskSubmissions");
const taskCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("tasks");
const userCollection = client.db("ExperimentLabsInternshipPortal").collection("users");
const schoolCollection = client.db("ExperimentLabsInternshipPortal").collection("schools");
const orgCollection = client.db("ExperimentLabsInternshipPortal").collection("organizations");

module.exports.getAllTest = async (req, res, next) => {
  try {
    // Fetch all task submissions
    const taskSubmissions = await taskSubmissionCollection.find({}).toArray();

    // Get unique emails of users from task submissions
    const userEmails = Array.from(new Set(taskSubmissions.map(submission => submission.participantEmail)));

    // Fetch users based on the emails
    const users = await userCollection.find({ email: { $in: userEmails } }).toArray();

    // Map user details to a dictionary for quick access
    const userMap = users.reduce((acc, user) => {
      acc[user.email] = { counsellorId: user.counsellorId, schoolId: user.schoolId };
      return acc;
    }, {});

    // Update task submissions with user info
    const bulkOperations = taskSubmissions.map(submission => {
      const userInfo = userMap[submission.participantEmail];
      return {
        updateOne: {
          filter: { _id: submission._id },
          update: { $set: { counsellorId: userInfo.counsellorId, schoolId: userInfo.schoolId } }
        }
      };
    });

    // Perform bulk write operation to update task submissions
    await taskSubmissionCollection.bulkWrite(bulkOperations);

    res.json({ message: 'Task submissions updated successfully with user info' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task submissions with user info' });
  }
};

// module.exports.saveATest = async (req, res, next) => {
//   const data = req.body;
//   const result = await testCollection.insertOne(data);
//   res.send(result);
// };

// module.exports.deleteATest = async (req, res, next) => {
//   const { id } = req.params;
//   const result = await testCollection.deleteOne({ _id: new ObjectId(id) });
//   res.send(result);
// };


// module.exports.testSignUp = async (req, res, next) => {

//   admin.auth().createUser({
//     email: 'backendUser@example.com',
//     password: '123456',
//     // Other user properties if needed
//   })
//     .then((userRecord) => {
//       console.log('Successfully created new user:', userRecord.uid);
//       // Handle success
//     })
//     .catch((error) => {
//       console.error('Error creating new user:', error);
//       // Handle error
//     });

// }
