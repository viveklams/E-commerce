import express from "express";
import {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
} from "../controllers/productController.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.post("/", protectRoute, adminRoute, createProduct);

export default router;
