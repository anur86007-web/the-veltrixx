const mongoose = require("mongoose");

const customPriceSchema = new mongoose.Schema(
  {
    basePrice: {
      type: Number,
      default: 499,
      min: 0,
    },
    imageUploadCharge: {
      type: Number,
      default: 50,
      min: 0,
    },
    caseTypePrices: {
      hardCase: {
        type: Number,
        default: 0,
        min: 0,
      },
      siliconeCase: {
        type: Number,
        default: 80,
        min: 0,
      },
      toughCase: {
        type: Number,
        default: 140,
        min: 0,
      },
    },
    finishPrices: {
      glossy: {
        type: Number,
        default: 0,
        min: 0,
      },
      matte: {
        type: Number,
        default: 60,
        min: 0,
      },
      frosted: {
        type: Number,
        default: 90,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomPrice", customPriceSchema);
