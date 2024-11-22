import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100, // Discount should be between 1% to 100%
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: true, // Discount code has an expiry date
    },
  },
  { timestamps: true }
);

export default mongoose.model("Discount", discountSchema);
