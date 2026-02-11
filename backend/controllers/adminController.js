const pool = require("../db");

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, user_type, status, created_at FROM users ORDER BY created_at DESC"
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error("GET USERS ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
