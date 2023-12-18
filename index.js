const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const errorHandler = require("./middleware/errorHandler");
const testRoutes = require("./routes/v1/test.route");
const userRoutes = require("./routes/v1/users.route");
const chatRoutes = require("./routes/v1/chats.route");
const messageRoutes = require("./routes/v1/messages.route");
const organizationRoutes = require("./routes/v1/organizations.route");
const taskRoutes = require("./routes/v1/tasks.route");
const uploadFileRoutes = require("./routes/v1/uploadFile.route");

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
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/uploadFile", uploadFileRoutes);

app.get("/", (req, res) => {
  res.send("Experiment Labs server is running");
});

app.all("*", (req, res) => {
  res.send("No route found.");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

process.on("unhandledRejection", (error) => {
  console.log(error.name, error.message);
  app.close(() => {
    process.exit(1);
  });
});
