import express from "express";
import { signup, signin, updateProfile, getUserProfile, removeProfilePicture, getStats } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import multer from "multer";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Route for signing up a new user
router.post("/signup", signup);

// Add this new route for signing in an existing user
router.post("/signin", signin);

// Route for updating user profile
router.put("/update-profile", protectRoute, upload.single("profilePicture"), updateProfile);

// Route for getting user profile
router.get("/user/:id", protectRoute, getUserProfile);

// Route for removing profile picture
router.put("/remove-profile-picture", protectRoute, removeProfilePicture);

// Route for getting dashboard stats
router.get("/get-stats", protectRoute, getStats);

export default router;
