import mongoose from "mongoose";

// This is the schema that defines the structure of a "Note" document in our database
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    // A detailed description of the note's content
    description: {
      type: String,
      required: true,
    },
    // The selling price of the note
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"],
    },
    // The academic subject, e.g., "Math", "Computer Science"
    subject: {
      type: String,
      required: true,
    },
    // The secure URL where the file is stored on Cloudinary
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String, // URL for the JPG preview from Cloudinary
      default: "", // Default to an empty string
    },
    // The type of the file, e.g., "application/pdf"
    fileType: {
      type: String,
      required: true,
    },
    // A special field that links this note to a specific user
    seller: {
      type: mongoose.Schema.Types.ObjectId, // This stores a User's unique ID
      ref: "User", // This tells Mongoose that the ID belongs to a document in the 'User' collection
      required: true,
    },
  },
  {
    // This option automatically adds 'createdAt' and 'updatedAt' fields to the document
    timestamps: true,
  }
);

// Create the Mongoose model from the schema
const Note = mongoose.model("Note", noteSchema);

// Export the model so we can use it in other files (like our controller)
export default Note;
