const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const orgCollection = client.db("ExperimentLabsInternshipPortal").collection("organizations");
const taskCollection = client.db("ExperimentLabsInternshipPortal").collection("tasks");
const taskSubmissionCollection = client.db("ExperimentLabsInternshipPortal").collection("taskSubmissions");

module.exports.getStatsForCompaniesTask = async (req, res, next) => {
    
};