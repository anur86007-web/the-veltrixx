const express = require("express");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { couponCode, subtotal } = req.body;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      if (!coupon.isActive) {
        return res.status(400).json({
          success: false,
          message: "Coupon is inactive",
        });
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Coupon expired",
        });
      }

      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Coupon usage limit reached",
        });
      }

      const alreadyUsed = coupon.usedBy.some(
        (userId) => userId.toString() === req.user._id.toString()
      );

      if (alreadyUsed) {
        return res.status(400).json({
          success: false,
          message: "You have already used this coupon",
        });
      }

      if (Number(subtotal) < Number(coupon.minOrderAmount)) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount should be ₹${coupon.minOrderAmount}`,
        });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      ...req.body,
      couponCode: couponCode || "",
      orderStatus: req.body.orderStatus || "Order Placed",
      statusHistory: [
        {
          status: req.body.orderStatus || "Order Placed",
          date: new Date(),
        },
      ],
    });

    if (couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: couponCode.toUpperCase(),
          usedBy: { $ne: req.user._id },
        },
        {
          $inc: { usedCount: 1 },
          $addToSet: { usedBy: req.user._id },
        }
      );
    }

    res.status(201).json({
      success: true,
      message: "Order placed",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/admin/all", protect, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/admin/update/:id", protect, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== orderStatus) {
      order.orderStatus = orderStatus;

      order.statusHistory.push({
        status: orderStatus,
        date: new Date(),
      });
    }

    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/admin/delete/:id", protect, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Order deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/cancel/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const allowedStatuses = ["Order Placed", "Processing", "Packed"];

    if (!allowedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    order.orderStatus = "Cancelled";

    order.statusHistory.push({
      status: "Cancelled",
      date: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.put("/admin/all/:id/status", protect, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== orderStatus) {
      order.orderStatus = orderStatus;

      order.statusHistory.push({
        status: orderStatus,
        date: new Date(),
      });
    }

    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order status update failed",
      error: error.message,
    });
  }
});

module.exports = router;