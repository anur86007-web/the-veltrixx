const express = require("express");
const Review = require("../models/Review");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

/* ==========================
   ADD REVIEW WITH PHOTOS
========================== */

router.post("/", protect, upload.array("images", 3), async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    if (!product || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product, rating and comment are required",
      });
    }

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

    const imageUrls = req.files ? req.files.map((file) => file.path) : [];

    const review = await Review.create({
      user: req.user._id,
      product,
      name: req.user.name,
      rating: Number(rating),
      comment,
      images: imageUrls,
      verifiedPurchase: true,
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