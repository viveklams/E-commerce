import express from "express";
import {
  login,
  logout,
  refreshToken,
  signup,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

export default router;
