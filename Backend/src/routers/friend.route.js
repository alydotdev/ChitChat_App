import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  searchUserById,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/search/:userId", protectRoute, searchUserById);
router.post("/request", protectRoute, sendFriendRequest);
router.get("/requests", protectRoute, getPendingRequests);
router.post("/accept/:requestId", protectRoute, acceptFriendRequest);
router.post("/reject/:requestId", protectRoute, rejectFriendRequest);
router.get("/", protectRoute, getFriends);

export default router;
