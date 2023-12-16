const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const chatCollection = client.db('ExperimentLabsInternshipPortal').collection('chats');

module.exports.createChat = async (req, res, next) => {

    try {
        const chatData = req.body;
        const existingChat = await chatCollection.findOne({ 'users._id': { $all: chatData.users.map(user => user._id) } });

        if (existingChat) {
            return res.status(400).json({
                success: true,
                error: 'Chat between these users already exists'
            });
        }

        const result = await chatCollection.insertOne(chatData);

        res.status(201).json({
            success: true,
            message: 'Chat created successfully',
            result
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create chat'
        });
    }

};