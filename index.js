require("dotenv").config();




const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const { Server } = require("socket.io");

const connectDB = require("./serverjs/db/connect");
const setupSocket = require("./serverjs/config/socket");

const authRoute = require("./serverjs/routers/authRoute");
const searchRoute = require("./serverjs/routers/searchRoute")

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:  process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

app.use("/api/auth", authRoute);
app.use("/api/search", searchRoute)

setupSocket(io);

// Start server
const startServer = async () => {
  try {
    await connectDB(MONGO_URI);

    server.listen(PORT, () => {
      console.log(` Server running at ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
