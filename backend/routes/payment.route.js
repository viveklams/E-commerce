import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  checkoutSuccess,
  createCheckoutSession,
} from "../controllers/paymentController.js";
const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

//creatin stripe coupon

export default router;
