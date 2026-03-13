// backend/controllers/auth.controller.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import { encrypt, decrypt } from "../utils/encryption.js";
import Note from "../models/note.model.js";
import Order from "../models/order.model.js";

// --- SIGN UP a new user ---
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      isProfileComplete: newUser.isProfileComplete,
      hasSeenTour: newUser.hasSeenTour,
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- SIGN IN an existing user ---
export const signin = async (req, res) => {
  try {
    // 1. Get email and password from the request body
    const { email, password } = req.body;

    // 2. Find the user in the database by their email
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // 3. Compare the provided password with the hashed password in the database
    const validPassword = await bcrypt.compare(password, validUser.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials." }); // Use a generic message for security
    }

    // 4. If credentials are correct, create a JWT
    const token = jwt.sign(
      { id: validUser._id }, // The data we want to include in the token (payload)
      process.env.JWT_SECRET, // The secret key from our .env file
      { expiresIn: "1d" } // Optional: set an expiration time for the token
    );

    // 5. Separate the password from the rest of the user data
    // We do this so we don't send the hashed password back to the client
    const { password: hashedPassword, ...userData } = validUser._doc;

    // DECRYPT SENSITIVE DATA BEFORE SENDING TO CLIENT
    if (userData.upiId) userData.upiId = decrypt(userData.upiId);
    if (userData.bankDetails) {
      // We need to clone it to avoid modifying the mongoose document directly if it's attached
      const decryptedBankDetails = { ...userData.bankDetails };
      if (decryptedBankDetails.accountNumber) decryptedBankDetails.accountNumber = decrypt(decryptedBankDetails.accountNumber);
      if (decryptedBankDetails.ifscCode) decryptedBankDetails.ifscCode = decrypt(decryptedBankDetails.ifscCode);
      // Account Holder Name and Bank Name are usually not considered "secret" in the same way, but we can encrypt them if we want.
      // For now, let's just encrypt the account number and IFSC as they are critical.
      userData.bankDetails = decryptedBankDetails;
    }

    // 6. Send the token and user data back to the client
    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Error in signin controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- UPDATE PROFILE ---
import { v2 as cloudinary } from "cloudinary";

// Helper for Cloudinary upload
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// --- UPDATE PROFILE ---
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, college, major, gradYear, isProfileComplete, hasSeenTour, upiId, bankDetails } = req.body;
    let profilePictureUrl;

    // Handle File Upload if present
    if (req.file) {
      const uniqueFileName = `profile-${userId}-${Date.now()}`;
      const uploadOptions = {
        folder: "noteverse_profiles",
        public_id: uniqueFileName,
        resource_type: "image",
        transformation: [{ width: 500, height: 500, crop: "limit" }], // Resize for optimization
      };

      const uploadResult = await uploadToCloudinary(req.file.buffer, uploadOptions);
      profilePictureUrl = uploadResult.secure_url;
    }

    // Construct update object
    const updateData = { fullName, bio, college, major, gradYear };
    if (isProfileComplete !== undefined) updateData.isProfileComplete = isProfileComplete;
    if (hasSeenTour !== undefined) updateData.hasSeenTour = hasSeenTour;

    // ENCRYPT SENSITIVE DATA BEFORE SAVING
    if (upiId !== undefined) {
      updateData.upiId = encrypt(upiId);
    }

    if (bankDetails !== undefined) {
      let parsedBankDetails = bankDetails;
      if (typeof bankDetails === 'string') {
        try {
          parsedBankDetails = JSON.parse(bankDetails);
        } catch (e) {
          console.error("Failed to parse bankDetails", e);
        }
      }

      // Encrypt specific fields inside bankDetails
      if (parsedBankDetails) {
        updateData.bankDetails = {
          ...parsedBankDetails,
          accountNumber: encrypt(parsedBankDetails.accountNumber),
          ifscCode: encrypt(parsedBankDetails.ifscCode)
        };
      }
    }

    if (profilePictureUrl) {
      updateData.profilePicture = profilePictureUrl;
    }

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // DECRYPT DATA BEFORE SENDING BACK RESPONSE
    const userResponse = updatedUser.toObject();
    if (userResponse.upiId) userResponse.upiId = decrypt(userResponse.upiId);
    if (userResponse.bankDetails) {
      if (userResponse.bankDetails.accountNumber) userResponse.bankDetails.accountNumber = decrypt(userResponse.bankDetails.accountNumber);
      if (userResponse.bankDetails.ifscCode) userResponse.bankDetails.ifscCode = decrypt(userResponse.bankDetails.ifscCode);
    }

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- GET USER PROFILE ---
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user._id;

    // Increment view count if someone else is viewing the profile
    if (id !== viewerId.toString()) {
      await User.findByIdAndUpdate(id, { $inc: { profileViews: 1 } });
    }

    const user = await User.findById(id).select("fullName profilePicture college bio major gradYear profileViews");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// --- REMOVE PROFILE PICTURE ---
export const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and update profilePicture to null
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { profilePicture: "" } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // DECRYPT DATA BEFORE SENDING BACK RESPONSE
    const userResponse = updatedUser.toObject();
    if (userResponse.upiId) userResponse.upiId = decrypt(userResponse.upiId);
    if (userResponse.bankDetails) {
      if (userResponse.bankDetails.accountNumber) userResponse.bankDetails.accountNumber = decrypt(userResponse.bankDetails.accountNumber);
      if (userResponse.bankDetails.ifscCode) userResponse.bankDetails.ifscCode = decrypt(userResponse.bankDetails.ifscCode);
    }

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in removeProfilePicture controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- GET DASHBOARD STATS ---
export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Total Notes Uploaded
    const totalUploads = await Note.countDocuments({ seller: userId });

    // 2. Total Earnings (Sum of completed orders where user is seller)
    const completedSales = await Order.find({ seller: userId, status: "completed" });
    const totalEarnings = completedSales.reduce((sum, order) => sum + order.amount, 0);

    // 3. Notes Purchased (Count of completed orders where user is buyer)
    const notesPurchased = await Order.countDocuments({ buyer: userId, status: "completed" });

    // 4. Profile Views (From User model)
    const user = await User.findById(userId);
    const profileViews = user.profileViews || 0;

    res.status(200).json({
      totalEarnings,
      notesUploaded: totalUploads, // Changed to match frontend key
      notesPurchased,
      profileViews
    });
  } catch (error) {
    console.error("Error in getStats controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
