const express = require("express");
const { getUsers, getJobs } = require("../controllers/adminController");

const router = express.Router();

router.get("/users", getUsers);


module.exports = router;
