import express from "express";
import { getAllProducts } from "../controllers/productController";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protectRoute, getAllProducts);

export default router;
