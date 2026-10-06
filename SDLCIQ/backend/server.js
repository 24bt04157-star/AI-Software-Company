const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const requirementRoutes = require("./routes/requirementRoutes");
const taskRoutes = require("./routes/taskRoutes");
const bugRoutes = require("./routes/bugRoutes");
const testCaseRoutes = require("./routes/testCaseRoutes");
const deploymentRoutes = require("./routes/deploymentRoutes"); 
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/projects", projectRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/test-cases", testCaseRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/activity-logs", activityLogRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "SDLC Intelligence API is running 🚀"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});