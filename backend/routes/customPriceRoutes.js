const express = require("express");
const CustomPrice = require("../models/CustomPrice");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const defaultPrice = {
  basePrice: 499,
  imageUploadCharge: 50,
  caseTypePrices: {
    hardCase: 0,
    siliconeCase: 80,
    toughCase: 140,
  },
  finishPrices: {
    glossy: 0,
    matte: 60,
    frosted: 90,
  },
};

const getOrCreatePrice = async () => {
  let price = await CustomPrice.findOne();

  if (!price) {
    price = await CustomPrice.create(defaultPrice);
  }

  return price;
};

/* PUBLIC - CUSTOM CASE PRICE */
router.get("/", async (req, res) => {
  try {
    const price = await getOrCreatePrice();

    res.json({
      success: true,
      price,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ADMIN - UPDATE CUSTOM CASE PRICE */
router.put("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      basePrice,
      imageUploadCharge,
      caseTypePrices,
      finishPrices,
    } = req.body;

    const price = await getOrCreatePrice();

    price.basePrice = Number(basePrice ?? price.basePrice);
    price.imageUploadCharge = Number(imageUploadCharge ?? price.imageUploadCharge);

    price.caseTypePrices = {
      hardCase: Number(caseTypePrices?.hardCase ?? price.caseTypePrices.hardCase),
      siliconeCase: Number(caseTypePrices?.siliconeCase ?? price.caseTypePrices.siliconeCase),
      toughCase: Number(caseTypePrices?.toughCase ?? price.caseTypePrices.toughCase),
    };

    price.finishPrices = {
      glossy: Number(finishPrices?.glossy ?? price.finishPrices.glossy),
      matte: Number(finishPrices?.matte ?? price.finishPrices.matte),
      frosted: Number(finishPrices?.frosted ?? price.finishPrices.frosted),
    };

    await price.save();

    res.json({
      success: true,
      message: "Custom case price updated successfully",
      price,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
