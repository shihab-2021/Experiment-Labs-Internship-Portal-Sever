const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const orgCollection = client.db("ExperimentLabsInternshipPortal").collection("organizations");
const taskCollection = client.db("ExperimentLabsInternshipPortal").collection("tasks");
const taskSubmissionCollection = client.db("ExperimentLabsInternshipPortal").collection("taskSubmissions");
const userCollection = client.db("ExperimentLabsInternshipPortal").collection("users");

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


module.exports.getStatsForStudentSubmission = async (req, res, next) => {
    try {
        // Fetch total task posts count from taskCollection
        const totalSubmission = await taskSubmissionCollection.countDocuments();

        // Aggregate submissionStatus counts
        const submissionStatusCounts = await taskSubmissionCollection.aggregate([
            {
                $group: {
                    _id: "$submissionStatus",
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Convert the aggregation output to a more structured format
        const stats = {
            totalSubmission
        };

        // Adding submissionStatus counts to the stats object
        submissionStatusCounts.forEach((status) => {
            stats[status._id] = status.count;
        });

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}


module.exports.getStatsForCompaniesPostedTask = async (req, res, next) => {
    try {
        const taskAggregation = await taskCollection.aggregate([
            {
                $group: {
                    _id: "$creator.organizationId",
                    totalTasks: { $sum: 1 }
                }
            }
        ]).toArray();

        const organizationDetails = await Promise.all(taskAggregation.map(async (task) => {
            const organization = await orgCollection.findOne({ _id: new ObjectId(task._id) });
            return { ...task, organization };
        }));

        res.json(organizationDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total tasks by organization' });
    }
}


module.exports.getStatsForStudentSubmissionTable = async (req, res, next) => {
    try {
        const taskAggregation = await taskSubmissionCollection.find({}).toArray();

        const submissionDetails = await Promise.all(taskAggregation.map(async (task) => {
            const organization = await orgCollection.findOne({ _id: new ObjectId(task.organizationId) });
            const taskData = await taskCollection.findOne({ _id: new ObjectId(task.taskId) });
            const userData = await userCollection.findOne({email: task.participantEmail})
            return { ...task, userData, organization, taskData };
        }));

        res.json(submissionDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch total tasks by organization' });
    }
}