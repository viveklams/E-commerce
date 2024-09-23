import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//token
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

//store the refresh Token
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevents XSS attacks, cross-site shifting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF attack,cross-site request forgery
    maxAge: 15 * 60 * 1000, //15 mins
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevents XSS attacks, cross-site shifting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF attack,cross-site request forgery
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
  });
};

//SIGNUP
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }
    const user = await User.create({ name, email, password });

    //authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

//LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      await storeRefreshToken(user._id, refreshToken);

      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login Controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

//LOGOUT
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token: ${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken"),
      res.json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// export const refreshToken = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     console.log("Received refresh token:", req.cookies.refreshToken);

//     if (!refreshToken) {
//       return res.status(401).json({ message: "No refresh token provided" });
//     }

//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
//     console.log("Stored token in Redis:", storedToken);

//     if (!storedToken !== refreshToken) {
//       return res.status(401).json({ message: "Invalid refresh token" });
//     }

//     const accessToken = jwt.sign(
//       { userId: decoded.userId },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "15m" }
//     );

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true, //prevents XSS attacks, cross-site shifting attacks
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict", //prevents CSRF attack,cross-site request forgery
//       maxAge: 15 * 60 * 1000, //15 mins
//     });
//     res.json({ message: "token refreshed successfully" });
//   } catch (error) {
//     console.log("Error in refreshedToken controller", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.log("No refresh token provided");
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      console.log("Error verifying token:", error.message);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Refresh token expired" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }

    // Check if the refresh token is stored in Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    console.log("Stored token in Redis:", storedToken);

    if (storedToken !== refreshToken) {
      console.log("Provided token does not match stored token");
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // Set the new access token as a cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
