require("dotenv").config({ path: "./.env" });

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const { Server } = require("socket.io");

const connectDB = require("./serverjs/db/connect");
const setupSocket = require("./serverjs/config/socket");

// Routes
const authRoute = require("./serverjs/routers/authRoute");

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middlewares
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

// API Routes
app.use("/api/auth", authRoute);

// Setup WebSocket
setupSocket(io);

// Start server
const startServer = async () => {
  try {
    console.log("🧠 Connecting to MongoDB...");
    await connectDB(MONGO_URI);
    console.log("✅ MongoDB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();
