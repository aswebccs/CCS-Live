require("dotenv").config();
const nodemailer = require("nodemailer");

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Email transporter error:", error.message);
    } else {
        console.log("Email transporter ready:", success);
    }
});

const baseMailOptions = {
    from: `"CCS Platform" <${process.env.EMAIL_USER}>`,
    replyTo: SUPPORT_EMAIL,
    headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
    },
};

const sendMail = async ({ to, subject, html, text }) => {
    const result = await transporter.sendMail({
        ...baseMailOptions,
        to,
        subject,
        html,
        text,
    });

    console.log("Email sent:", {
        to,
        subject,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
    });

    return result;
};

exports.sendVerificationEmail = async (to, token) => {
    const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;
    const subject = "Verify your email";

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to CCS Platform</h2>
          <p>Please verify your email to activate your account:</p>
          <a href="${verifyUrl}" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
          <p>If you did not register, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    const text = [
        "Welcome to CCS Platform",
        `Please verify your email: ${verifyUrl}`,
        "If you did not register, you can safely ignore this email.",
    ].join("\n");

    return sendMail({ to, subject, html, text });
};

exports.sendResetPasswordEmail = async (to, token) => {
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
    const subject = "Password reset request";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.5; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 640px; margin: 0 auto;">
          <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); margin: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 48px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px;">Password Reset Request</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #ede9fe; opacity: 0.9;">Secure your account quickly</p>
            </div>
            <div style="padding: 48px 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #1f2937; font-weight: 500;">Hi,</p>
              <p style="margin: 0 0 32px 0; font-size: 15px; color: #4b5563; line-height: 1.7;">We received a request to reset your password for your CCS account.</p>
              <div style="margin: 40px 0; text-align: center;">
                <a href="${resetUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Reset Password</a>
              </div>
              <div style="height: 1px; background-color: #e5e7eb; margin: 32px 0;"></div>
              <p style="margin: 0; font-size: 14px; color: #5b21b6; line-height: 1.6;">
                <strong>Link expires in 15 minutes.</strong> If you did not request this change, ignore this email.
              </p>
              <p style="margin: 24px 0 0 0; font-size: 15px; color: #1f2937;">Best regards,<br><span style="font-weight: 600; color: #0d9488; font-size: 16px;">Team CCS</span></p>
            </div>
            <div style="background-color: #f3f4f6; padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">
                <a href="${FRONTEND_URL}" style="color: #7c3aed; text-decoration: none; font-weight: 600;">CCS Platform</a>
                <span style="color: #d1d5db; margin: 0 6px;">-</span>
                <a href="mailto:${SUPPORT_EMAIL}" style="color: #7c3aed; text-decoration: none; font-weight: 600;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="margin: 12px 0 0 0; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px;">
                This is an automated transactional email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = [
        "Password reset request",
        `Reset link: ${resetUrl}`,
        "This link expires in 15 minutes.",
        "If you did not request this, ignore this email.",
    ].join("\n");

    return sendMail({ to, subject, html, text });
};

exports.sendWelcomeStudentEmail = async (to, studentName, userType = "Student / Professional") => {
    const loginLink = `${FRONTEND_URL}/login`;
    const subject = "Welcome to CCS - Let's get started";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; margin-top: 10px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to CCS</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName || "User"},</p>
            <p>Your account has been successfully created as <strong>${userType}</strong>.</p>
            <p><a href="${loginLink}" class="btn">Go to Login</a></p>
            <p>Best regards,<br><strong>Team CCS</strong></p>
          </div>
          <div class="footer">
            <p>CCS Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = [
        `Hi ${studentName || "User"},`,
        `Your CCS account has been created as ${userType}.`,
        `Login: ${loginLink}`,
    ].join("\n");

    return sendMail({ to, subject, html, text });
};

exports.sendJobApplicationEmail = async (to, studentName, jobDetails) => {
    const dashboardLink = `${FRONTEND_URL}/dashboard`;
    const { jobTitle = "Job", companyName = "Company", jobLocation = "Not specified", applicationDate = new Date().toLocaleDateString() } = jobDetails || {};
    const subject = "Your application has been submitted";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; margin-top: 10px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your application has been submitted</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName || "User"},</p>
            <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted.</p>
            <p>Location: ${jobLocation}<br>Application Date: ${applicationDate}</p>
            <p><a href="${dashboardLink}" class="btn">View Dashboard</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = [
        `Hi ${studentName || "User"},`,
        `Application submitted for ${jobTitle} at ${companyName}.`,
        `Location: ${jobLocation}`,
        `Application Date: ${applicationDate}`,
        `Dashboard: ${dashboardLink}`,
    ].join("\n");

    return sendMail({ to, subject, html, text });
};

exports.sendJobLiveEmail = async (to, companyName, jobDetails) => {
    const jobLink = `${FRONTEND_URL}/jobs/${jobDetails?.jobId || ""}`;
    const jobTitle = jobDetails?.title || "Job";
    const jobLocation = jobDetails?.location || "Not specified";
    const postedDate = jobDetails?.postedDate || new Date().toLocaleDateString();
    const subject = "Your job is now live on CCS";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .btn { display: inline-block; margin-top: 10px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your job is now live on CCS</h1>
          </div>
          <div class="content">
            <p>Hi ${companyName || "Company"} Team,</p>
            <p>Your job posting is now live and visible to candidates.</p>
            <p>Job: <strong>${jobTitle}</strong><br>Location: ${jobLocation}<br>Posted On: ${postedDate}</p>
            <p><a href="${jobLink}" class="btn">View Job</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = [
        `Hi ${companyName || "Company"} Team,`,
        `Your job is live: ${jobTitle}`,
        `Location: ${jobLocation}`,
        `Posted On: ${postedDate}`,
        `View: ${jobLink}`,
    ].join("\n");

    return sendMail({ to, subject, html, text });
};
