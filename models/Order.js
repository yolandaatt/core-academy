const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
});

// Update status timestamps
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "completed") {
      this.completedAt = Date.now();
    } else if (this.status === "cancelled") {
      this.cancelledAt = Date.now();
    }
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
