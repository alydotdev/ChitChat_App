import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getUserForSidebar , getMessages ,sendMessage, markMessagesAsRead} from '../controllers/message.controllers.js';
const router = express.Router();


router.get("/users", protectRoute, getUserForSidebar)
router.put("/read/:id", protectRoute, markMessagesAsRead)
router.get("/:id", protectRoute, getMessages )
router.post("/send/:id", protectRoute , sendMessage)
export default router ; 