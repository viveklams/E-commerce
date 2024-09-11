import express from "express";
import { getAllProducts } from "../controllers/productController.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);

export default router;
