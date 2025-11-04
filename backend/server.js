import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./db/connectDatabase.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;
const secret = process.env.COOKIE_SECRET;
const frontendBaseURL = process.env.FRONTEND_BASE_URL;

// ✅ CORS Setup — FIXED
const allowedOrigins = [
  "http://localhost:5173",
  "https://full-stack-mini-task-management-app-sable.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow requests without origin (e.g., Postman)
      
      // Clean origin — remove trailing paths like /login or /signup
      const cleanOrigin = origin.split("/")[0] + "//" + origin.split("/")[2];
      
      if (allowedOrigins.includes(cleanOrigin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secret));

// ✅ Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello, Welcome To Vooshfoods" });
});

// ✅ Start Server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server started on PORT: ${PORT}`);
});
