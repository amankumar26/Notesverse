import Razorpay from "razorpay";
import crypto from "node:crypto";
import Order from "../models/order.model.js";
import Note from "../models/note.model.js";
import dotenv from "dotenv";
import { decrypt } from "../utils/encryption.js";

dotenv.config();

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export const createOrder = async (req, res) => {
  try {
    const { noteId } = req.body;
    const buyerId = req.user._id;

    const note = await Note.findById(noteId).populate("seller");
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.seller._id.toString() === buyerId.toString()) {
      return res.status(400).json({ error: "You cannot buy your own note" });
    }

    // Use Razorpay if configured, else fallback to Direct UPI
    if (razorpay) {
      const options = {
        amount: Math.round(note.price * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const newOrder = new Order({
        buyer: buyerId,
        seller: note.seller._id,
        note: noteId,
        razorpayOrderId: razorpayOrder.id,
        amount: note.price,
        currency: "INR",
        status: "pending",
      });

      await newOrder.save();

      return res.status(201).json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        noteTitle: note.title,
        method: "razorpay"
      });
    } else {
      // Manual UPI fallback
      return res.status(200).json({
        amount: note.price,
        currency: "INR",
        upiId: note.seller.upiId ? decrypt(note.seller.upiId) : null,
        noteTitle: note.title,
        method: "upi_qr"
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const recordManualPayment = async (req, res) => {
  try {
    const { noteId, utr, amount } = req.body;
    const buyerId = req.user._id;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ error: "Note not found" });

    // Mark as completed for now to unlock note instantly for testing.
    // In production, this would be 'pending_verification'.
    const newOrder = new Order({
      buyer: buyerId,
      seller: note.seller,
      note: noteId,
      amount: amount || note.price,
      currency: "INR",
      transactionId: utr,
      status: "completed",
    });

    await newOrder.save();

    res.status(201).json({ message: "Payment recorded successfully", order: newOrder });
  } catch (error) {
    console.error("Error manual payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "completed",
        },
        { new: true }
      );

      return res.status(200).json({ message: "Payment verified successfully", order });
    } else {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
