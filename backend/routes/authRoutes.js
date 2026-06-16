const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const sendOtpEmail = async (email, otp) => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error("Brevo SMTP environment variables missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.verify();

  await transporter.sendMail({
    from: `"THE VELTRIXX" <theveltrixx@gmail.com>`,
    to: email,
    subject: "THE VELTRIXX Password Reset OTP",
    html: `
      <div style="font-family:Arial;padding:20px;background:#f7f7f7;">
        <div style="max-width:520px;margin:auto;background:white;padding:28px;border-radius:16px;border:1px solid #eee;">
          <h2 style="margin:0 0 10px;color:#111;">THE VELTRIXX</h2>
          <h3 style="margin:0 0 18px;color:#111;">Password Reset OTP</h3>

          <p style="color:#555;font-size:15px;line-height:1.6;">
            Your OTP for resetting your THE VELTRIXX account password is:
          </p>

          <div style="font-size:34px;font-weight:bold;letter-spacing:6px;background:#111;color:#fff;padding:16px;text-align:center;border-radius:12px;margin:20px 0;">
            ${otp}
          </div>

          <p style="color:#555;font-size:14px;">
            This OTP will expire in 10 minutes.
          </p>

          <p style="color:#777;font-size:13px;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Register successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* FORGOT PASSWORD - SEND OTP */

router.post("/forgot-password", async (req, res) => {
  try {
    console.log("FORGOT PASSWORD REQUEST RECEIVED");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = await bcrypt.hash(otp, 10);
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();

    console.log("OTP GENERATED, SENDING EMAIL");

    await sendOtpEmail(email, otp);

    console.log("OTP EMAIL SENT SUCCESSFULLY");

    res.json({
      success: true,
      message: "OTP sent to your registered email",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD OTP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "OTP sending failed",
      error: error.message,
    });
  }
});

/* VERIFY RESET OTP */

router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!user || !user.resetOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.resetOtp);

    if (!isOtpMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isOtpVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

/* RESET PASSWORD AFTER OTP VERIFY */

router.put("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email,
      isOtpVerified: true,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required or OTP expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = "";
    user.resetOtpExpire = undefined;
    user.isOtpVerified = false;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. You are logged in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
});

/* ADMIN USER MANAGEMENT */

router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/users/role/:id", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: "User role updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;