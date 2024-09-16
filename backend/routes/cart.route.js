import express from "express";

import {
  addToCart,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cartController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;
