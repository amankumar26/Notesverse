import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: false, // Text is optional for offers
        },
        messageType: {
            type: String,
            enum: ["text", "offer"],
            default: "text",
        },
        referencedNote: {
            noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note" },
            title: String,
            thumbnailUrl: String,
            price: Number,
            currency: String,
            subject: String,
            sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            originalPrice: Number,
            discountedPrice: Number,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        // We can store senderName/ProfilePic snapshot if we want, but referencing User is better.
        // However, for the current frontend logic which expects these in the payload, we might not need to store them if we populate.
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
