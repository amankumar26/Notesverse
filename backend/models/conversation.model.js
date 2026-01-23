import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastMessage: {
            type: String,
            default: "",
        },
        lastMessageSenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        unreadCounts: {
            type: Map,
            of: Number, // Key: userId, Value: count
            default: {},
        },
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
