import express from "express";

import { addToCart } from "../controllers/cartController.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);

export default router;
