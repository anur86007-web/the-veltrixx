const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

router.post("/create-order", async (req, res) => {
  try {
    console.log("CREATE ORDER HIT");
    console.log("Body:", req.body);
    console.log("Key ID:", process.env.RAZORPAY_KEY_ID);

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount missing",
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `veltrixx_${Date.now()}`,
    });

    console.log("Razorpay order created:", order.id);

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    console.log("RAZORPAY ERROR MESSAGE:", error.message);
    console.log("RAZORPAY FULL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Could not create Razorpay order",
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: "Payment verified",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  } catch (error) {
    console.log("VERIFY ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;