const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const testCollection = client.db("fhi-tool").collection("test");
// const admin = require('firebase-admin');
// const serviceAccount = require('../serviceAccountKey.json'); // Path to your service account key JSON file

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // Other optional configurations
// });

module.exports.getAllTest = async (req, res, next) => {
  const result = await testCollection.find({}).toArray();

  res.send(result);
};

module.exports.saveATest = async (req, res, next) => {
  const data = req.body;
  const result = await testCollection.insertOne(data);
  res.send(result);
};

module.exports.deleteATest = async (req, res, next) => {
  const { id } = req.params;
  const result = await testCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};


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
