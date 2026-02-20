require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const welcomeRoutes = require("./routes/welcomeRoutes");
const collegeRoutes = require("./routes/collegeRoutes");
const companyRoutes = require("./routes/companyRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const universityRoutes = require("./routes/universityRoutes");
const examManagementRoutes = require("./routes/examManagementRoutes");
const geoRoutes = require("./routes/geoRoutes");
const adminRoutes = require("./routes/adminRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const eventRoutes = require("./routes/eventRoutes");
const ensureSoftDeleteColumns = require("./utils/ensureSoftDeleteColumns");

const app = express();

console.log(process.env.FRONTEND_URL, "--->")
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/welcome", welcomeRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/university", universityRoutes);
app.use("/api/exam-management", examManagementRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/events", eventRoutes);

const startServer = async () => {
  try {
    await ensureSoftDeleteColumns();
    console.log("Soft-delete columns ensured");
  } catch (err) {
    console.error("Failed to ensure soft-delete columns:", err.message);
  }

  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
};

startServer();