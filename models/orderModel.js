import mongoose from "mongoose";

// Create a schema for order items
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.ObjectId,
    ref: "Products",
    required: true,
  },
  quantity: {
    type: String,
    required: true,
    default: 1,
  },
  price: {
    type: String,
    required: true,
  },
  color: {
    type: String, // Array of color strings
    default: "default",
  },
});

// Create a schema for the order
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.ObjectId,
      ref: "users",
      required: true,
    },
    txnid: {
      type: String,
      requried: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    secondName: {
      type: String,
      required: true,
    },
    products: [orderItemSchema],
    totalAmount: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Not Process",
        "Payment success",
        "Payment status pending",
        "Payment failed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Not Process",
    },
    paymentMethod: {
      type: String,
      enum: ["Online Payment"], // Only allowing online payment
      default: "Online Payment",
    },
  },
  { timestamps: true }
);

// Export the Order model as default
export default mongoose.model("Order", orderSchema);
