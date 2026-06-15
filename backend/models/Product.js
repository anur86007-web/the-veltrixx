const mongoose = require("mongoose");

const colorOptionSchema = new mongoose.Schema(
  {
    name: String,
    hex: String,
    image: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "Premium phone case by THE VELTRIXX.",
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Phone Case",
    },

    tags: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
    },

    comparePrice: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    profit: {
      type: Number,
      default: 0,
    },

    margin: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    stock: {
      type: Number,
      default: 10,
    },

    sku: {
      type: String,
      default: "",
    },

    lowStockAlert: {
      type: Number,
      default: 5,
    },

    availableModels: {
      type: [String],
      default: [],
    },

    colorOptions: {
      type: [colorOptionSchema],
      default: [],
    },

    weight: {
      type: Number,
      default: 0,
    },

    deliveryDays: {
      type: String,
      default: "3-7 business days",
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    returnPolicy: {
      type: String,
      default: "Replacement only for damaged or defective products.",
    },

    seoTitle: {
      type: String,
      default: "",
    },

    seoDescription: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "draft", "out-of-stock"],
      default: "active",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 4.8,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);