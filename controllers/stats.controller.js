const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const orgCollection = client.db("ExperimentLabsInternshipPortal").collection("organizations");
const taskCollection = client.db("ExperimentLabsInternshipPortal").collection("tasks");
const taskSubmissionCollection = client.db("ExperimentLabsInternshipPortal").collection("taskSubmissions");

module.exports.getStatsForCompaniesTask = async (req, res, next) => {
    try {
        // Fetch total companies count from orgCollection
        const totalCompanies = await orgCollection.countDocuments();

        // Fetch total task posts count from taskCollection
        const totalTaskPosts = await taskCollection.countDocuments();

        // Aggregate submissionStatus counts
        const submissionStatusCounts = await taskCollection.aggregate([
            {
                $group: {
                    _id: "$taskStatus",
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Convert the aggregation output to a more structured format
        const stats = {
            totalCompanies,
            totalTaskPosts
        };

        // Adding submissionStatus counts to the stats object
        submissionStatusCounts.forEach((status) => {
            stats[status._id] = status.count;
        });

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};