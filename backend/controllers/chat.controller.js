import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
    try {
        const { recipientId, text, referencedNote, messageType, replyTo } = req.body;
        const senderId = req.user._id;

        // 1. Save Message
        const newMessage = new Message({
            senderId,
            recipientId,
            text,
            referencedNote,
            messageType: messageType || "text",
            replyTo,
        });
        await newMessage.save();

        // 2. Update or Create Conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                unreadCounts: {
                    [senderId]: 0,
                    [recipientId]: 0,
                },
            });
        }

        conversation.lastMessage = text;
        conversation.lastMessageSenderId = senderId;

        // Increment unread count for recipient
        const currentUnread = conversation.unreadCounts.get(String(recipientId)) || 0;
        conversation.unreadCounts.set(String(recipientId), currentUnread + 1);

        await conversation.save();

        // Populate sender info and replyTo for the response
        const populatedMessage = await newMessage.populate([
            { path: "senderId", select: "fullName profilePicture" },
            { path: "replyTo", select: "text senderId" } // Populate basic info of replied message
        ]);

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate("participants", "fullName profilePicture")
            .sort({ updatedAt: -1 });

        // Transform data for frontend
        const formattedConversations = conversations.map((conv) => {
            const otherParticipant = conv.participants.find(
                (p) => p._id.toString() !== userId.toString()
            );
            return {
                id: otherParticipant._id,
                name: otherParticipant.fullName,
                avatar: otherParticipant.profilePicture,
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCounts.get(String(userId)) || 0,
                updatedAt: conv.updatedAt,
            };
        });

        res.status(200).json(formattedConversations);
    } catch (error) {
        console.error("Error in getConversations:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const userId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: userId, recipientId: otherUserId },
                { senderId: otherUserId, recipientId: userId },
            ],
        }).sort({ createdAt: 1 }).populate("replyTo", "text senderId");

        // Reset unread count for this conversation
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, otherUserId] },
        });

        if (conversation) {
            conversation.unreadCounts.set(String(userId), 0);
            await conversation.save();
        }

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteConversation = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const userId = req.user._id;

        // Delete the conversation document
        await Conversation.findOneAndDelete({
            participants: { $all: [userId, otherUserId] },
        });

        // Delete all messages between these two users
        await Message.deleteMany({
            $or: [
                { senderId: userId, recipientId: otherUserId },
                { senderId: otherUserId, recipientId: userId },
            ],
        });

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error("Error in deleteConversation:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteMessages = async (req, res) => {
    try {
        const { messageIds } = req.body;
        const userId = req.user._id;

        // Delete messages where the user is either sender or recipient
        await Message.deleteMany({
            _id: { $in: messageIds },
            $or: [{ senderId: userId }, { recipientId: userId }]
        });

        res.status(200).json({ message: "Messages deleted successfully" });
    } catch (error) {
        console.error("Error in deleteMessages:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
