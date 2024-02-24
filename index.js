const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "https://chat-appilcation.vercel.app/",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const sessionId = socket.request._query["sessionId"];

  if (sessionId) {
    socket.join(`user_${sessionId}`);
  }

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_msg", (data) => {
    console.log(data, "message received from client");
    //This will send a message to a specific room ID
    socket.to(data.roomId).emit("receive_msg", data);
  });

  socket.on("send_friend_request", (data) => {
    console.log(data);
    console.log(
      "joining room",
      `user_${data.user2._id} to send friend request`
    );
    socket.to(`user_${data.user2._id}`).emit("receive_friend_request", data);
  });

  socket.on("respond_to_friend_request", (data) => {
    console.log(data);
    console.log(
      "joining room",
      `user_${data.user1._id} to respond to friend request`
    );
    if (data.status === "accept") {
      socket
        .to(`user_${data.user1._id}`)
        .emit("receive_response_to_friend_request", data);
      socket
        .to(`user_${data.user2._id}`)
        .emit("receive_response_to_friend_request", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
