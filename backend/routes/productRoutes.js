const express = require("express");
const Product = require("../models/Product");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    const imageUrls = req.files.map((file) => file.path);

    res.json({
      success: true,
      message: "Images uploaded successfully",
      images: imageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const price = Number(req.body.price) || 0;
    const costPrice = Number(req.body.costPrice) || 0;

    const profit = price - costPrice;
    const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

    const product = await Product.create({
      ...req.body,
      price,
      costPrice,
      comparePrice: Number(req.body.comparePrice) || 0,
      stock: Number(req.body.stock) || 0,
      lowStockAlert: Number(req.body.lowStockAlert) || 5,
      weight: Number(req.body.weight) || 0,
      shippingCharge: Number(req.body.shippingCharge) || 0,
      profit,
      margin,
    });

    res.status(201).json({
      success: true,
      message: "Product added",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const price = Number(req.body.price) || 0;
    const costPrice = Number(req.body.costPrice) || 0;

    const profit = price - costPrice;
    const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        price,
        costPrice,
        comparePrice: Number(req.body.comparePrice) || 0,
        stock: Number(req.body.stock) || 0,
        lowStockAlert: Number(req.body.lowStockAlert) || 5,
        weight: Number(req.body.weight) || 0,
        shippingCharge: Number(req.body.shippingCharge) || 0,
        profit,
        margin,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Product updated",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;