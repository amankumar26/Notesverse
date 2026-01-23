import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { sendMessage, getConversations, getMessages, deleteConversation, deleteMessages } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/send", protectRoute, sendMessage);
router.get("/conversations", protectRoute, getConversations);
router.get("/messages/:id", protectRoute, getMessages);
router.delete("/conversations/:id", protectRoute, deleteConversation);
router.delete("/messages", protectRoute, deleteMessages);

export default router;
