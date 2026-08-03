require("dotenv").config();
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/tasks");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const contactRoutes = require("./routes/contact");

const app = express();
const PORT = 5000;

// Allows your Vite frontend (localhost:5173) to make requests to this
// server (localhost:5000). Without this, the browser blocks the requests
// due to the same-origin policy, even though both run on your own machine.
app.use(cors());

// Lets Express parse incoming JSON request bodies (e.g. POST/PUT bodies)
// into req.body. Without this, req.body would be undefined.
app.use(express.json());

// Every route inside routes/tasks.js is now available under /api/tasks
// e.g. router.get("/") becomes GET /api/tasks
//      router.get("/:id") becomes GET /api/tasks/:id
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes); 
app.use("/api/contact", contactRoutes);

// Basic root route, just to confirm the server is alive when visited directly.
app.get("/", (req, res) => {
  res.send("TaskFlow API is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});