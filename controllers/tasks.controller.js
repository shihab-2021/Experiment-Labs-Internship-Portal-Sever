const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const taskCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("tasks");

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

module.exports.getAllTask = async (req, res, next) => {
  const result = await taskCollection.find({}).toArray();
  res.send(result);
};

module.exports.deleteATask = async (req, res, next) => {
  const { id } = req.params;
  const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};
