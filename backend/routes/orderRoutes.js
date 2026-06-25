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

/* DOWNLOAD PROFESSIONAL INVOICE */
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

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=veltrixx-invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const left = 40;
    const right = pageWidth - 40;

    const formatAmount = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
    const safe = (value) => String(value || "N/A");

    doc.rect(0, 0, pageWidth, 105).fill("#111111");

    doc.fillColor("#ffffff").fontSize(26).text("THE VELTRIXX", left, 28);
    doc.fontSize(10).text("Premium Custom Phone Cases", left, 60);
    doc.fontSize(10).text("www.theveltrixx.co.in", left, 76);

    doc.fontSize(22).text("INVOICE", 420, 32, { align: "right" });
    doc.fontSize(10).text(`INV-${order._id.toString().slice(-8).toUpperCase()}`, 420, 62, {
      align: "right",
    });

    doc.fillColor("#111111");

    let y = 135;

    doc.fontSize(12).text("Invoice Details", left, y);
    doc.fontSize(10);
    y += 22;

    const detailRows = [
      ["Order ID", order._id],
      ["Invoice Date", new Date(order.createdAt).toLocaleDateString("en-IN")],
      ["Order Status", order.orderStatus || "Order Placed"],
      ["Payment Method", order.paymentMethod || "N/A"],
      ["Payment Status", order.paymentStatus || "Pending"],
    ];

    detailRows.forEach(([label, value]) => {
      doc.fillColor("#666").text(label, left, y);
      doc.fillColor("#111").text(safe(value), 160, y);
      y += 18;
    });

    y += 18;

    const boxY = y;
    const boxH = 115;

    doc.roundedRect(left, boxY, 245, boxH, 12).stroke("#dddddd");
    doc.roundedRect(310, boxY, 245, boxH, 12).stroke("#dddddd");

    doc.fillColor("#111").fontSize(13).text("Bill To", left + 18, boxY + 18);
    doc.fontSize(10);
    doc.text(safe(order.customer?.name), left + 18, boxY + 42);
    doc.text(`Phone: ${safe(order.customer?.phone)}`, left + 18, boxY + 58);
    doc.text(
      `${safe(order.customer?.address)}${order.customer?.landmark ? ", " + order.customer.landmark : ""}`,
      left + 18,
      boxY + 74,
      { width: 205 }
    );
    doc.text(
      `${safe(order.customer?.city)}, ${safe(order.customer?.state)} - ${safe(
        order.customer?.pincode
      )}`,
      left + 18,
      boxY + 92,
      { width: 205 }
    );

    doc.fillColor("#111").fontSize(13).text("Ship To", 328, boxY + 18);
    doc.fontSize(10);
    doc.text(safe(order.customer?.name), 328, boxY + 42);
    doc.text(`Phone: ${safe(order.customer?.phone)}`, 328, boxY + 58);
    doc.text(
      `${safe(order.customer?.address)}${order.customer?.landmark ? ", " + order.customer.landmark : ""}`,
      328,
      boxY + 74,
      { width: 205 }
    );
    doc.text(
      `${safe(order.customer?.city)}, ${safe(order.customer?.state)} - ${safe(
        order.customer?.pincode
      )}`,
      328,
      boxY + 92,
      { width: 205 }
    );

    y = boxY + boxH + 35;

    doc.fontSize(14).fillColor("#111").text("Order Items", left, y);
    y += 25;

    doc.rect(left, y, right - left, 30).fill("#111111");
    doc.fillColor("#ffffff").fontSize(10);
    doc.text("Product", left + 12, y + 10);
    doc.text("Qty", 330, y + 10);
    doc.text("Price", 390, y + 10);
    doc.text("Amount", 470, y + 10);

    y += 30;

    order.items.forEach((item) => {
      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);
      const amount = qty * price;

      doc.rect(left, y, right - left, 58).stroke("#eeeeee");

      doc.fillColor("#111").fontSize(10).text(item.name || "Product", left + 12, y + 10, {
        width: 250,
      });

      doc
        .fillColor("#666")
        .fontSize(9)
        .text(
          `${item.brand || ""} • ${item.selectedModel || item.model || ""} • ${
            item.selectedColor || "Default"
          }`,
          left + 12,
          y + 28,
          { width: 250 }
        );

      doc.fillColor("#111").fontSize(10);
      doc.text(String(qty), 330, y + 18);
      doc.text(formatAmount(price), 390, y + 18);
      doc.text(formatAmount(amount), 470, y + 18);

      y += 58;
    });

    y += 25;

    const summaryX = 335;
    const summaryW = 220;

    doc.roundedRect(summaryX, y, summaryW, 125, 12).stroke("#dddddd");

    const summaryRows = [
      ["Subtotal", order.subtotal],
      ["Shipping", order.shipping],
      ["Discount", `- ${formatAmount(order.discount)}`],
    ];

    let sy = y + 18;

    summaryRows.forEach(([label, value]) => {
      doc.fillColor("#666").fontSize(10).text(label, summaryX + 16, sy);
      doc
        .fillColor("#111")
        .text(
          typeof value === "string" ? value : formatAmount(value),
          summaryX + 115,
          sy,
          { width: 85, align: "right" }
        );
      sy += 22;
    });

    doc.moveTo(summaryX + 16, sy).lineTo(summaryX + summaryW - 16, sy).stroke("#dddddd");
    sy += 16;

    doc.fillColor("#111").fontSize(13).text("Grand Total", summaryX + 16, sy);
    doc.fontSize(15).text(formatAmount(order.total), summaryX + 115, sy - 2, {
      width: 85,
      align: "right",
    });

    y += 155;

    if (order.couponCode) {
      doc.fillColor("#16a34a").fontSize(10).text(`Coupon Applied: ${order.couponCode}`, left, y);
      y += 18;
    }

    doc
      .fillColor("#111")
      .fontSize(10)
      .text(`Order Status: ${order.orderStatus || "Order Placed"}`, left, y);

    y += 18;

    doc
      .fontSize(10)
      .text(`Payment Status: ${order.paymentStatus || "Pending"}`, left, y);

    doc.rect(0, 760, pageWidth, 82).fill("#111111");
    doc.fillColor("#ffffff").fontSize(11).text("Thank you for shopping with THE VELTRIXX.", 40, 782, {
      align: "center",
      width: pageWidth - 80,
    });
    doc
      .fontSize(9)
      .fillColor("#dddddd")
      .text("For support, visit www.theveltrixx.co.in or contact us through the website.", 40, 802, {
        align: "center",
        width: pageWidth - 80,
      });

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