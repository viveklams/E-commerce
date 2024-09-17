//packages
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
//database connection
import { connectDB } from "./lib/db.js";
//call the dotenv function
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
console.log(process.env.PORT);

//allows you to parse body of the request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//authentication
//routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/coupons", couponRoutes);

app.listen(PORT, () => {
  console.log("server is running on http://localhost:" + PORT);

  connectDB();
});

//j5h9ImrIzgjBSuON
