const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const messageCollection = client.db('ExperimentLabsInternshipPortal').collection('messages');
const chatCollection = client.db('ExperimentLabsInternshipPortal').collection('chats');

module.exports.sendMessage = async (req, res, next) => {
    try {
        const { senderId, content, contentType, chatId } = req.body;

        // Retrieve chat details from the chats collection
        const chat = await chatCollection.findOne({
            _id: new ObjectId(chatId),
            'users._id': senderId
        });

        // res.send(chat);
        if (!chat) {
            return res.status(404).json({ error: 'Sender not found in the chat' });
        }

        const { latestMessage, ...updatedChat } = chat;

        const message = {
            chat: updatedChat,
            senderId,
            content,
            contentType,
            createdAt: new Date(),
            readBy: [] // Initially, no one has read the message
        };

        // Save the message to the messages collection
        const messageData = await messageCollection.insertOne(message);

        // Update the latest message in the chat
        const chatData = await chatCollection.updateOne(
            { _id: chat?._id },
            {
                $set: { latestMessage: message } // Update the latest message in the chat
            }
        );

        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            messageData,
            chatData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
};


module.exports.getMessageByChatId = async (req, res, next) => {
    try {
        const chatId = req.params.chatId;
        const messages = await messageCollection.find({
            'chat._id': new ObjectId(chatId)
        }).toArray();

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
};