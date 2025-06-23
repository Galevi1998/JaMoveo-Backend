// serverjs/config/socket.js
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const onlineUsers = new Map(); 

function broadcastOnlineUsers(io) {
    const users = Array.from(io.onlineUsers.entries()).map(([id, data]) => ({
      id,
      username: data.username,
      picture: data.picture,
      instruments: data.instruments,
    }));
  
    io.emit("online-users", users); // Send full user list
  }
  

function setupSocket(io) {
  console.log("🛠️ Setting up WebSocket middleware...");

  io.use((socket, next) => {
    console.log("🔐 Middleware triggered for socket:", socket.id);

    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
      console.log("⚠️ No cookies found in handshake headers");
      return next(new Error("No cookie"));
    }

    const parsed = cookie.parse(rawCookie);
    console.log("🍪 Parsed cookies:", parsed);

    const token = parsed.token;
    if (!token) {
      console.log("🚫 Token not found in cookies");
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      console.log(`✅ Token verified. User ID: ${decoded.id}`);
      next();
    } catch (err) {
      console.log("❌ Invalid token during socket handshake:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (!userId) {
      console.log("🚫 Connected socket has no valid user ID");
      return;
    }

    const { username, picture, instruments } = socket.user;

    onlineUsers.set(userId, {
      socketId: socket.id,
      username,
      picture,
      instruments,
    });

    console.log(`🟢 User ${userId} connected [socket ${socket.id}]`);
    console.log("numbers of online users:", onlineUsers.size);
    console.log("📡 Current Online Users:");
    for (const [id, userData] of onlineUsers.entries()) {
      console.log(
        `👤 ${userData.username || "Unknown"} (ID: ${id})\n` +
        `   🎵 Instruments: ${userData.instruments || "N/A"}\n` +
        `   🖼️ Picture: ${userData.picture || "N/A"}\n` +
        `   🔌 Socket ID: ${userData.socketId}\n`
      );
    }

    socket.broadcast.emit("user-online", userId);
    broadcastOnlineUsers(io);

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`🔴 User ${userId} disconnected`);
      socket.broadcast.emit("user-offline", userId);
      broadcastOnlineUsers(io);
    });

    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  io.onlineUsers = onlineUsers;
}

module.exports = setupSocket;
