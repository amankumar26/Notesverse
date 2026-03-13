import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createOrder, verifyPayment, recordManualPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protectRoute, createOrder);
router.post("/verify-payment", protectRoute, verifyPayment);
router.post("/record-manual-payment", protectRoute, recordManualPayment);

export default router;
