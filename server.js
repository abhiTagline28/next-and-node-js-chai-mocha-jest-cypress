const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import config
const config = require("./config");

// Import database
const { connectDB } = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const teacherRoutes = require("./routes/teachers");

// Import error handler
const { globalErrorHandler } = require("./utils/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Global error handling middleware
app.use(globalErrorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = config.PORT || 3000;

  // Connect to MongoDB only when starting the server
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

module.exports = app;
