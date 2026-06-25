const express = require("express");
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const router = express.Router();

/* PLACE ORDER */
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

/* USER ORDERS */
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

/* DOWNLOAD INVOICE */
router.get("/invoice/:id", protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=veltrixx-invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(24).text("THE VELTRIXX", { align: "center" });
    doc.fontSize(10).text("Premium Custom Phone Cases", { align: "center" });

    doc.moveDown(2);

    doc.fontSize(18).text("INVOICE", { align: "left" });
    doc.moveDown();

    doc.fontSize(11);
    doc.text(`Invoice No: INV-${order._id.toString().slice(-8).toUpperCase()}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Order Status: ${order.orderStatus}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);

    doc.moveDown();

    doc.fontSize(14).text("Bill To");
    doc.fontSize(11);
    doc.text(order.customer?.name || "Customer");
    doc.text(`Phone: ${order.customer?.phone || "N/A"}`);
    doc.text(
      `${order.customer?.address || ""}${
        order.customer?.landmark ? ", " + order.customer.landmark : ""
      }`
    );
    doc.text(
      `${order.customer?.city || ""}, ${order.customer?.state || ""} - ${
        order.customer?.pincode || ""
      }`
    );

    doc.moveDown();

    doc.fontSize(14).text("Order Items");
    doc.moveDown(0.5);

    doc.fontSize(11).text("Product", 50, doc.y, { continued: true });
    doc.text("Qty", 300, doc.y, { continued: true });
    doc.text("Price", 370, doc.y, { continued: true });
    doc.text("Amount", 470, doc.y);

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();

    order.items.forEach((item) => {
      const amount = Number(item.price || 0) * Number(item.qty || 1);

      doc.fontSize(10).text(item.name || "Product", 50, doc.y, {
        width: 230,
        continued: false,
      });

      doc.fontSize(9).text(
        `${item.brand || ""} ${item.selectedModel || item.model || ""} ${
          item.selectedColor ? "• " + item.selectedColor : ""
        }`,
        50,
        doc.y,
        { width: 230 }
      );

      const rowY = doc.y - 25;

      doc.fontSize(10).text(String(item.qty || 1), 300, rowY);
      doc.text(`Rs. ${item.price || 0}`, 370, rowY);
      doc.text(`Rs. ${amount}`, 470, rowY);

      doc.moveDown();
    });

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();

    if (order.couponCode) {
      doc.fontSize(11).text(`Coupon Applied: ${order.couponCode}`, {
        align: "right",
      });
    }

    if (order.discount > 0) {
      doc.fontSize(11).text(`Discount: Rs. ${order.discount}`, {
        align: "right",
      });
    }

    doc.fontSize(16).text(`Total Amount: Rs. ${order.total || 0}`, {
      align: "right",
    });

    doc.moveDown(2);

    doc.fontSize(10).text(
      "Thank you for shopping with THE VELTRIXX. For support, contact us through our website.",
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ADMIN GET ALL ORDERS */
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

/* ADMIN UPDATE ORDER STATUS - OLD ENDPOINT */
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

    order.orderStatus = orderStatus;

    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: orderStatus,
      date: new Date(),
    });

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

/* ADMIN UPDATE ORDER STATUS - FRONTEND ENDPOINT */
router.put("/admin/all/:id/status", protect, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const allowedStatuses = [
      "Order Placed",
      "Processing",
      "Packed",
      "Shipped",
      "Out For Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: orderStatus,
      date: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
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

/* ADMIN DELETE ORDER */
router.delete("/admin/delete/:id", protect, adminOnly, async (req, res) => {
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

/* USER CANCEL ORDER */
router.put("/cancel/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
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

    order.statusHistory = order.statusHistory || [];
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

module.exports = router;