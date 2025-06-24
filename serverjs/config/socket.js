const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const onlineUsers = new Map();
let delSong = false;
let song = null ;


function broadcastOnlineUsers(io) {
  const users = Array.from(io.onlineUsers.entries()).map(([id, data]) => ({
    id,
    username: data.username,
    picture: data.picture,
    instruments: data.instruments,
    status: data.status,
  }));

  io.emit("online-users", users);
}

function setupSocket(io) {

  io.use((socket, next) => {

    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
      return next(new Error("No cookie"));
    }

    const parsed = cookie.parse(rawCookie);

    const token = parsed.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (!userId) {
      return;
    }

    const { username, picture, instruments,status } = socket.user;

    onlineUsers.set(userId, {
      socketId: socket.id,
      status,
      username,
      picture,
      instruments,
    });

    if (song) {
      socket.emit("start-song", song);
    }

    socket.on("get-online-users", () => {
      const users = Array.from(onlineUsers.entries()).map(([id, data]) => ({
        id,
        username: data.username,
        picture: data.picture,
        instruments: data.instruments,
        status: data.status,
      }));
      socket.emit("online-users", users);
    });


    socket.broadcast.emit("user-online", userId);
    broadcastOnlineUsers(io);

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user-offline", userId);
      broadcastOnlineUsers(io);
    });

    socket.on("ping", () => {
      socket.emit("pong");
    });

    socket.on("song-selected", ({ selectedSong, songData ,isHebrew }) => {
      song = { selectedSong, songData, isHebrew };
      io.emit("start-song", song); 
    });

    socket.on("admin-stop-rehearsal", () => {
      delSong = true;
      song = null; 
      io.emit("quit-rehearsal", { delSong });
    });
  });

  io.onlineUsers = onlineUsers;
}

module.exports = setupSocket;
