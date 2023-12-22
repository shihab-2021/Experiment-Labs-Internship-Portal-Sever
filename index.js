const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const errorHandler = require("./middleware/errorHandler");
const testRoutes = require("./routes/v1/test.route");
const uploadFileRoutes = require("./routes/v1/uploadFile.route");
const userRoutes = require("./routes/v1/users.route");
const chatRoutes = require("./routes/v1/chats.route");
const messageRoutes = require("./routes/v1/messages.route");
const organizationRoutes = require("./routes/v1/organizations.route");
const taskRoutes = require("./routes/v1/tasks.route");
const taskSubmissionRoutes = require("./routes/v1/taskSubmissions.route");

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use(cors());
app.use(express.json());
app.use(express.static("front"));

// Error handler middleware
app.use(errorHandler);

// Attach your routes after the error handler
app.use("/api/v1/test", testRoutes);

//for chats
app.use("/api/v1/chats", chatRoutes);

//for messages
app.use("/api/v1/messages", messageRoutes);

// For users
app.use("/api/v1/users", userRoutes);

// For organizations
app.use("/api/v1/organizations", organizationRoutes);

// For tasks
app.use("/api/v1/tasks", taskRoutes);

// For tasks submissions
app.use("/api/v1/taskSubmissions", taskSubmissionRoutes);

// For upload file
app.use("/api/v1/uploadFile", uploadFileRoutes);

app.get("/", (req, res) => {
  res.send("Experiment Labs server is running");
});

app.all("*", (req, res) => {
  res.send("No route found.");
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


const io = require("socket.io")(server, {
  // pingTimeout: 60000,
  cors: {
    origin: process.env.Origin
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");
    // console.log(newMessageReceived);

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.senderId) return;
      socket.in(user?._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});


process.on("unhandledRejection", (error) => {
  console.log(error.name, error.message);
  app.close(() => {
    process.exit(1);
  });
});
