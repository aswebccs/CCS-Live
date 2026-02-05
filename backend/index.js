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
const skillTestRoutes = require("./routes/Skilltestroutes");
const app = express();

// app.use(
//     cors({
//         origin: "http://localhost:5173",
//         credentials: true,
//     })
// );
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
app.use("/api/skill-tests", skillTestRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
