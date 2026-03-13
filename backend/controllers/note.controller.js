import Note from "../models/note.model.js";
import User from "../models/user.model.js";
import path from "path";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary"; // Import the main cloudinary object
import { decrypt } from "../utils/encryption.js";
import Order from "../models/order.model.js";

// This is a helper function that takes a file buffer (from memory) and uploads it to Cloudinary.
// It returns a Promise, so we can use await with it.
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    // cloudinary.uploader.upload_stream is used for uploading from a buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          // If Cloudinary returns an error, reject the promise
          return reject(error);
        }
        // If the upload is successful, resolve the promise with the result
        resolve(result);
      }
    );
    // End the stream by sending the file buffer
    uploadStream.end(fileBuffer);
  });
};

// --- UPLOAD a new note (MANUAL UPLOAD LOGIC) ---
export const uploadNote = async (req, res) => {
  try {
    const { title, description, price, subject, currency } = req.body;
    const sellerId = req.user._id;

    // --- 1. Validate Input ---
    if (!req.file) {
      return res.status(400).json({ error: "File is required." });
    }
    if (!title || !description || !price || !subject) {
      return res.status(400).json({ error: "All text fields are required." });
    }

    // --- 2. Sanitize the Filename ---
    const fileExt = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, fileExt);
    // Replace any character that is not a letter or number with a hyphen
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "-");
    const uniqueFileName = `${sanitizedBaseName}-${Date.now()}`;

    // --- 3. Manually Upload to Cloudinary ---
    const uploadOptions = {
      folder: "noteverse_files",
      public_id: uniqueFileName,
      resource_type: "auto", // Use 'auto' to automatically detect file type (allows PDF thumbnails)
      // 'eager' transformations create the thumbnail at the same time as the main upload
      eager: [{ fetch_format: "jpg", page: 1, width: 400, crop: "limit" }],
    };

    // Await the result from our helper function. req.file.buffer contains the file from memory.
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      uploadOptions
    );

    // --- 4. Get URLs from the Cloudinary Result ---
    const originalFileUrl = uploadResult.secure_url;
    // The transformed thumbnail URL is in the 'eager' array of the result
    let thumbnailUrl = "";
    if (uploadResult.eager && uploadResult.eager.length > 0) {
      thumbnailUrl = uploadResult.eager[0].secure_url;
    }

    // --- 5. Save to Database ---
    const newNote = new Note({
      title,
      description,
      price: Number(price),
      currency: currency || "USD",
      subject,
      fileUrl: originalFileUrl,
      thumbnailUrl: thumbnailUrl,
      fileType: req.file.mimetype,
      seller: sellerId,
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error in uploadNote controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({})
      .populate("seller", "fullName profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Invalid token, treat as guest
      }
    }

    const note = await Note.findById(id).populate(
      "seller",
      "fullName profilePicture"
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    let isPurchased = false;
    if (userId) {
      // Check if user is the seller
      if (note.seller._id.toString() === userId.toString()) {
        isPurchased = true;
      } else {
        // Check if user has a completed order for this note
        const order = await Order.findOne({
          buyer: userId,
          note: id,
          status: "completed",
        });
        if (order) isPurchased = true;
      }
    }

    const noteObj = note.toObject();
    noteObj.isPurchased = isPurchased;

    res.status(200).json(noteObj);
  } catch (error) {
    console.error("Error in getNoteById controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query is required." });
    }
    const searchFilter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { subject: { $regex: query, $options: "i" } },
      ],
    };
    const notes = await Note.find(searchFilter)
      .populate("seller", "fullName profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in searchNotes controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMyNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const myNotes = await Note.find({ seller: userId }).sort({ createdAt: -1 });
    res.status(200).json(myNotes);
  } catch (error) {
    console.error("Error in getMyNotes controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getNotesBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const notes = await Note.find({ seller: sellerId })
      .populate("seller", "fullName profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getNotesBySeller controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- UPDATE NOTE ---
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, subject, currency } = req.body;
    const userId = req.user._id;

    // Find the note
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    // Check ownership
    if (note.seller.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to update this note." });
    }

    // Update fields
    note.title = title || note.title;
    note.description = description || note.description;
    note.price = price || note.price;
    note.currency = currency || note.currency;
    note.subject = subject || note.subject;

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error("Error in updateNote controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- DELETE NOTE ---
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the note
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    // Check ownership
    if (note.seller.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this note." });
    }

    // Delete from Database
    await Note.findByIdAndDelete(id);

    // TODO: Ideally, we should also delete the file from Cloudinary using its public_id
    // But for now, we'll just remove the record from the database.

    res.status(200).json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("Error in deleteNote controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// --- GET PAYMENT DETAILS FOR A NOTE ---
export const getNotePaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id).populate(
      "seller",
      "fullName upiId bankDetails"
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    const seller = note.seller;
    const paymentDetails = {
      sellerName: seller.fullName,
      upiId: seller.upiId ? decrypt(seller.upiId) : null,
      bankDetails: null
    };

    if (seller.bankDetails) {
      // We need to access the properties directly from the mongoose object or convert to object first
      // Mongoose subdocuments can be tricky. Let's convert to object.
      const bankObj = seller.bankDetails.toObject ? seller.bankDetails.toObject() : seller.bankDetails;

      paymentDetails.bankDetails = {
        accountNumber: bankObj.accountNumber ? decrypt(bankObj.accountNumber) : "",
        ifscCode: bankObj.ifscCode ? decrypt(bankObj.ifscCode) : "",
        accountHolderName: bankObj.accountHolderName,
        bankName: bankObj.bankName
      };
    }

    res.status(200).json(paymentDetails);
  } catch (error) {
    console.error("Error in getNotePaymentDetails controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- GET PURCHASED NOTES ---
export const getPurchasedNotes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all completed orders for this user
    const orders = await Order.find({ buyer: userId, status: "completed" }).populate({
      path: "note",
      populate: {
        path: "seller",
        select: "fullName profilePicture"
      }
    });

    // Extract the note objects and mark them as purchased
    const notes = orders
      .filter(order => order.note) // Ensure the note still exists
      .map(order => {
        const noteObj = order.note.toObject();
        noteObj.isPurchased = true;
        return noteObj;
      });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getPurchasedNotes controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
