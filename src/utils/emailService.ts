import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables if not already loaded
dotenv.config();

// Debug logging
console.log("Current working directory:", process.cwd());
console.log("Environment variables loaded:", {
  SMTP_USER: process.env.SMTP_USER ? "set" : "missing",
  SMTP_PASS: process.env.SMTP_PASS ? "set" : "missing",
  SMTP_FROM: process.env.SMTP_FROM ? "set" : "missing",
});

if (
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS ||
  !process.env.SMTP_FROM
) {
  console.error("Missing required SMTP environment variables:", {
    SMTP_USER: process.env.SMTP_USER ? "set" : "missing",
    SMTP_PASS: process.env.SMTP_PASS ? "set" : "missing",
    SMTP_FROM: process.env.SMTP_FROM ? "set" : "missing",
  });
  throw new Error("Missing required SMTP environment variables");
}

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Configuration Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  password: string
) => {
  const mailOptions = {
    from: `"Church App Support" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Welcome to SDA Church App - Your Account Details",
    html: `
      <h1>Welcome to UBH, ${firstName}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
    
      <p>Best regards,<br>The SDA Church App Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      });
    }
    return false;
  }
};
