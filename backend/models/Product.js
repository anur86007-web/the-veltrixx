const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    model: String,
    price: Number,
    image: String,
    stock: Number,
    description: String,

    availableModels: {
      type: [String],
      default: [],
    },

    colorOptions: {
      type: [
        {
          name: String,
          hex: String,
          image: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);