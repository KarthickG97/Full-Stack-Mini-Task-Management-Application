import userModel from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const domain =
  process.env.NODE_ENV === "production"
    ? "taskmanger-server-qg2o.onrender.com"
    : "localhost";

/**
 * @desc    User Signup
 * @route   POST /api/v1/user/signup
 */
const signupUser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  const existUser = await userModel.findOne({ email });
  if (existUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new userModel({
    firstname,
    lastname,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();

    // Generate and set JWT token
    generateToken(res, newUser._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(" Signup Error:", error.message);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

/**
 * @desc    User Login
 * @route   POST /api/v1/user/login
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Please fill all fields" });

  const existingUser = await userModel.findOne({ email });

  if (!existingUser)
    return res.status(404).json({ message: "User not found" });

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid)
    return res.status(401).json({ message: "Invalid password" });

  // Generate and set JWT token
  generateToken(res, existingUser._id);

  res.status(200).json({
    message: "Login successful",
    user: {
      _id: existingUser._id,
      firstname: existingUser.firstname,
      lastname: existingUser.lastname,
      email: existingUser.email,
    },
  });
});

/**
 * @desc    Logout User
 * @route   POST /api/v1/user/logout
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @desc    Google OAuth Signup/Login
 * @route   POST /api/v1/user/google
 */
const google = asyncHandler(async (req, res) => {
  const { name, email, googlePhotoUrl } = req.body;

  if (!name || !email)
    return res.status(400).json({ message: "Invalid Google user data" });

  try {
    let user = await userModel.findOne({ email });

    if (user) {
      // Existing user → login
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const { password, ...rest } = user._doc;

      res
        .status(200)
        .cookie("jwt", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          domain,
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({ message: "Google login successful", user: rest });
    } else {
      // New Google user → register
      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = new userModel({
        firstname: name,
        lastname: name,
        email,
        profilePicture: googlePhotoUrl,
        password: hashedPassword,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const { password, ...rest } = newUser._doc;

      res
        .status(201)
        .cookie("jwt", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
          domain,
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({ message: "Google signup successful", user: rest });
    }
  } catch (error) {
    console.error(" Google Auth Error:", error.message);
    res.status(500).json({ message: "Google authentication failed", error: error.message });
  }
});

export { signupUser, loginUser, logoutUser, google };
