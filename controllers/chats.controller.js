const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const chatCollection = client.db('ExperimentLabsInternshipPortal').collection('chats');
const orgCollection = client.db("ExperimentLabsInternshipPortal").collection("organizations");
const userCollection = client.db("ExperimentLabsInternshipPortal").collection("users");

module.exports.createChat = async (req, res, next) => {

    try {
        const chatData = req.body;
        const existingChat = await chatCollection.findOne({ 'users._id': { $all: chatData.users.map(user => user._id) } });

        if (existingChat) {
            return res.status(201).json({
                chatId: existingChat._id,
                success: true,
                message: 'Chat between these users already exists'
            });
        }

        const result = await chatCollection.insertOne(chatData);

        res.status(201).json({
            success: true,
            isSendMessage: true,
            message: 'Chat created successfully',
            chatId: result.insertedId,
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
        const chats = await chatCollection.find({ 'users._id': userId }).toArray();

        const chatsWithUserInfo = await Promise.all(
            chats.map(async (chat) => {
                const usersWithOrgInfo = await Promise.all(
                    chat.users.map(async (user) => {
                        const userInfo = await userCollection.findOne({ _id: new ObjectId(user._id) });
                        let organizationInfo = {};

                        if (userInfo && userInfo.organizations && userInfo.organizations.length > 0) {
                            const organizationId = userInfo.organizations[0].organizationId;
                            organizationInfo = await orgCollection.findOne({ _id: new ObjectId(organizationId) });
                        }
                        return { ...userInfo, organizationInfo };
                    })
                );

                const latestMessage = { ...chat.latestMessage };
                if (latestMessage.senderId) {
                    const senderUserInfo = await userCollection.findOne({ _id: new ObjectId(latestMessage.senderId) });
                    latestMessage.senderInfo = senderUserInfo ? senderUserInfo : {};
                }

                return { ...chat, users: usersWithOrgInfo, latestMessage };
            })
        );

        const sortedChats = chatsWithUserInfo.sort((a, b) => {
            const createdAtA = a.latestMessage.createdAt;
            const createdAtB = b.latestMessage.createdAt;
            return createdAtB - createdAtA;
        });

        res.status(200).send({
            success: true,
            userChats: sortedChats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chats'
        });
    }
}


module.exports.getAllChatsWithUserInfo = async (req, res) => {
    try {
        const chats = await chatCollection.find({}).toArray();

        const chatsWithUserInfo = await Promise.all(
            chats.map(async (chat) => {
                const usersWithOrgInfo = await Promise.all(
                    chat.users.map(async (user) => {
                        const userInfo = await userCollection.findOne({ _id: new ObjectId(user._id) });
                        let organizationInfo = {};

                        if (userInfo && userInfo.organizations && userInfo.organizations.length > 0) {
                            const organizationId = userInfo.organizations[0].organizationId;
                            organizationInfo = await orgCollection.findOne({ _id: new ObjectId(organizationId) });
                        }
                        return { ...userInfo, organizationInfo };
                    })
                );

                const latestMessage = { ...chat.latestMessage };
                if (latestMessage.senderId) {
                    const senderUserInfo = await userCollection.findOne({ _id: new ObjectId(latestMessage.senderId) });
                    latestMessage.senderInfo = senderUserInfo ? senderUserInfo : {};
                }

                return { ...chat, users: usersWithOrgInfo, latestMessage };
            })
        );

        const sortedChats = chatsWithUserInfo.sort((a, b) => {
            const createdAtA = a.latestMessage.createdAt;
            const createdAtB = b.latestMessage.createdAt;
            return createdAtB - createdAtA;
        });

        res.status(200).send({
            success: true,
            userChats: sortedChats
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chats with user and organization info' });
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