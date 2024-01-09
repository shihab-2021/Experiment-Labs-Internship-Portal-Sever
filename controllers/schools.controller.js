const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const schoolCollection = client
  .db("ExperimentLabsInternshipPortal")
  .collection("schools");

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
