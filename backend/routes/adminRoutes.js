const express = require("express");
const {
  getUsers,
  getJobs,
  getReferralSummary,
  getReferrals,
  getSignupSummary,
  getSignups,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", getUsers);
router.get("/jobs", getJobs);
router.get("/referrals/summary", getReferralSummary);
router.get("/referrals", getReferrals);
router.get("/signups/summary", getSignupSummary);
router.get("/signups", getSignups);


module.exports = router;
