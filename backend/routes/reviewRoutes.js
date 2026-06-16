const express = require("express");
const Review = require("../models/Review");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* ==========================
   ADD REVIEW
========================== */

router.post("/", protect, async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product,
      name: req.user.name,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ==========================
   PRODUCT REVIEWS
========================== */

router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ==========================
   ADMIN - ALL REVIEWS
========================== */

router.get("/admin/all", protect, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name brand model image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ==========================
   ADMIN DELETE REVIEW
========================== */

router.delete("/admin/delete/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;