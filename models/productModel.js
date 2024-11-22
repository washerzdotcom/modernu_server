import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldprice: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    photos: [
      {
        data: Buffer,
        contentType: String,
      },
    ],
    colors: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    Shipping: {
      type: Boolean,
    },
    productType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);
