// backend/routes/note.route.js

import express from "express";
import multer from "multer"; // We only need multer now
import {
  uploadNote,
  getAllNotes,
  getNoteById,
  searchNotes,
  getMyNotes,
  updateNote,
  deleteNote,
  getNotesBySeller,
  getNotePaymentDetails,
} from "../controllers/note.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// --- THIS IS THE KEY CHANGE ---
// Configure multer to use memory storage.
// This holds the file as a buffer in RAM temporarily.
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// The route definition remains the same, but the 'upload' object is now different.
router.get("/my-notes", protectRoute, getMyNotes);
router.get("/search", searchNotes);
router.get("/seller/:sellerId", getNotesBySeller);
router.post("/upload", protectRoute, upload.single("noteFile"), uploadNote);
router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.get("/:id/payment-details", protectRoute, getNotePaymentDetails);
router.put("/:id", protectRoute, updateNote);
router.delete("/:id", protectRoute, deleteNote);

export default router;
