import express from "express";
import {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  deleteProduct,
  getRecommendations,
  getProductsByCategory,
  toggleFeaturedProduct,
} from "../controllers/productController.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendations);
router.get("/category/:category", getProductsByCategory);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
