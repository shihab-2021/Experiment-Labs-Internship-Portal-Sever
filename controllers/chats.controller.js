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


module.exports.getChatByUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const userChats = await chatCollection.find({ 'users._id': userId }).toArray();

        res.status(200).send({
            success: true,
            userChats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chats'
        });
    }
}



module.exports.updateChatReadStatus = async (req, res, next) => {
    try {
        const chatId = req.params.chatId;
        const { userId } = req.body; // Assuming userId is sent in the request body

        // Update the chat's latestMessage readBy array
        const updateResult = await chatCollection.updateOne(
            { _id: new ObjectId(chatId) },
            {
                $addToSet: { 'latestMessage.readBy': userId }
            }
        );

        if (updateResult.modifiedCount > 0) {
            res.status(200).json({
                success: true,
                message: 'Read status updated successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Chat or user not found or user is not the sender of latest message'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update read status'
        });
    }
}