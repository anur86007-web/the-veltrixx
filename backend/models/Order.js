const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: String,
        name: String,
        brand: String,
        model: String,
        price: Number,
        qty: Number,
        image: String,
        selectedImage: String,
        selectedColor: String,
      },
    ],

    customer: {
      name: String,
      phone: String,
      address: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String,
    },

    total: Number,
    paymentMethod: String,

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    orderStatus: {
      type: String,
      default: "Order Placed",
    },

    statusHistory: [
      {
        status: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

orderSchema.pre("save", function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.orderStatus || "Order Placed",
      date: new Date(),
    });
  }
});

module.exports = mongoose.model("Order", orderSchema);