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
        type: Boolean,
        default: false,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

export default User;