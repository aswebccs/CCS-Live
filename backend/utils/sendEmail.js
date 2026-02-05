require('dotenv').config();
const nodemailer = require("nodemailer");

// configure transporter (Hostinger SMTP)
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password
    },
});

/**
 * Send verification email
 * @param {string} to - user's email
 * @param {string} token - verification token
 */
exports.sendVerificationEmail = async (to, token) => {
    const verifyUrl = `http://localhost:5173/verify-email/${token}`;

    await transporter.sendMail({
        from: `"CCS Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Verify your email",
        html: `
      <h2>Welcome to CCS Platform!</h2>
      <p>Please verify your email to activate your account:</p>
      <a href="${verifyUrl}" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>If you did not register, you can safely ignore this email.</p>
    `,
    });
};

/**
 * 🔑 RESET PASSWORD EMAIL
 */
exports.sendResetPasswordEmail = async (to, token) => {
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
        from: `"CCS Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Reset your password",
        html: `
      <h2>Password Reset Request</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
    `,
    });
};