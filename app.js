/*MODULES*/
//Express
const express = require("express");
//Request Handlers
const userHandlers = require("./scripts/request_handlers/user-handlers");
const roomHandlers = require("./scripts/request_handlers/room-handlers");
const messageHandlers = require("./scripts/request_handlers/message-handlers");
//Body Parser
const bodyParser = require("body-parser");
//Express Session
const session = require("express-session");
//Passport
const passport = require("passport");
//Authentication
const authentication = require("./scripts/authentication");
//HTTP
const http = require("http");
//Socket.IO
const { Server } = require("socket.io");

/*SERVER*/
const app = express();
const server = http.createServer(app);
const io = new Server(server);

/*MIDDLEWARES*/
//Static Folder
app.use(express.static("www"));

//Session
app.use(
  session({
    secret: "Q2hhdERhdA==",
    resave: false,
    saveUninitialized: false,
  })
);

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Passport
app.use(passport.initialize());
app.use(passport.session());
authentication(passport);

/*ROUTERS*/
//Login
app.post("/login", userHandlers.login);

//Signup
app.post("/signup", userHandlers.signup);

//Logout
app.get("/logout", userHandlers.logout);

//Verify Login
app.get("/verify-login", userHandlers.verifyLogin);

//Get Rooms
app.get("/rooms", roomHandlers.getRooms);

//Get Room By Name
app.get("/room/:roomName", roomHandlers.getRoomByName);

//Get Room Members
app.get("/room/:roomId/members", roomHandlers.getRoomMembers);

//Create Room
app.post("/create-room", roomHandlers.createRoom);

//Enter Room
app.post("/enter-room", roomHandlers.enterRoom);

//Get User Rooms
app.get("/user/:userId/rooms", roomHandlers.getUserRooms);

//Send Message
app.post("/send-message", messageHandlers.sendMessage);

//Get Room Messages
app.get("/room/:roomId/messages", messageHandlers.getRoomMessages);

/*WEB SOCKET*/
io.on("connection", (socket) => {
  //Connect
  console.log("A user connected");

  //Disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  //Join Room
  socket.on("join room", (room, user, socketId) => {
    socket.join(room);
    io.to(room).emit("join room", room, user, socket.id);
  });

  //Leave Room
  socket.on("leave room", (room, user) => {
    socket.leave(room);
    io.to(room).emit("leave room", room, user);
  });

  //Public Message
  socket.on("public message", (room, message) => {
    io.to(room).emit("public message", room, message);
  });

  //Private Message
  socket.on("private message", (socketId, message) => {
    socket.to(socketId).emit("private message", socketId, message);
  });

  //Public Notification
  socket.on("public notification", (room, message) => {
    socket.to(room).emit("public notification", room, message);
  });

  //Private Notification
  socket.on("private notification", (socketId, message) => {
    socket.to(socketId).emit("private notification", socketId, message);
  });

  //User Typing
  socket.on("user typing", (room, user) => {
    socket.to(room).emit("user typing", room, user);
  });

  //User not typing
  socket.on("user not typing", (room) => {
    socket.to(room).emit("user not typing", room);
  });
});

/*LISTENING PORT*/
server.listen(8080, function () {
  console.log("Server running at port 8080");
});
