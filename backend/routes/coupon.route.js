import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.get("/validate", protectRoute, validateCoupon);

export default router;
