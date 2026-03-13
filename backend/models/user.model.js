// backend/models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Every email must be unique
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Enforce a minimum password length
    },
    profilePicture: {
        type: String, // We will store the URL from Cloudinary here
        default: "",
    },
    college: {
        type: String,
        default: "",
    },
    major: {
        type: String,
        default: "",
    },
    gradYear: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    isProfileComplete: {
        type: Boolean,
        default: false,
    },
    hasSeenTour: {
        type: Boolean,
        default: false,
    },
    upiId: {
        type: String,
        default: "",
    },
    bankDetails: {
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
        accountHolderName: { type: String, default: "" },
        bankName: { type: String, default: "" },
    },
    profileViews: {
        type: Number,
        default: 0,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

export default User;