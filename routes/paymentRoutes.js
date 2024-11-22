import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/orderModel.js"; // Adjust this path based on your structure
import Products from "../models/productModel.js";

const router = express.Router();
dotenv.config(); // Load .env variables

// Generate PayU hash function
const generateHash = (data) => {
  const hashString = `${data.merchantKey}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${data.salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");
  return hash;
};

router.post("/pay", async (req, res) => {
  try {
    const {
      firstName,
      secondName,
      address,
      city,
      state,
      pin,
      phone,
      amount,
      cartItems,
      userId,
    } = req.body;

    const txnid = `txnid_${new Date().getTime()}`; // Unique transaction ID

    // Prepare PayU data
    const payuData = {
      merchantKey: process.env.Test_Merchant_Key,
      salt: process.env.Test_Merchant_Salt,
      amount: amount,
      productinfo: "ShoppingCartItems",
      firstname: firstName,
      email: "customer@example.com", // Hardcoded for now
      phone: phone,
      surl: `http://localhost:8080/api/v1/payment/success?txnid=${txnid}`,
      furl: `http://localhost:8080/api/v1/payment/failure?txnid=${txnid}`,
      txnid: txnid,
    };

    const hash = generateHash(payuData);

    const formData = {
      key: payuData.merchantKey,
      txnid: payuData.txnid,
      amount: payuData.amount,
      productinfo: payuData.productinfo,
      firstname: payuData.firstname,
      email: payuData.email,
      phone: payuData.phone,
      surl: payuData.surl,
      furl: payuData.furl,
      hash: hash,
    };

    const payuUrl = process.env.Test_Environment;

    // Create order using the cart items
    const products = cartItems.map((item) => ({
      product: item._id,
      price: item.price,
      quantity: item.quantity || 1,
      color: item.color,
      productType: item.productType,
    }));

    const newOrder = new Order({
      user: userId,
      txnid: payuData.txnid,
      products: products,
      firstName: payuData.firstname,
      secondName: secondName,
      totalAmount: payuData.amount,
      address: address,
      city: city,
      state: state,
      pin: pin,
      paymentMethod: "Online Payment",
      status: "Payment status pending",
    });

    await newOrder.save();

    // Update product quantities after saving the order
    for (const item of cartItems) {
      const product = await Products.findById(item._id);

      if (product) {
        // Find the index of the color that matches the item color
        const colorIndex = product.colors.findIndex(
          (color) => color.name === item.color
        );

        if (colorIndex !== -1) {
          // Check if the color has enough stock to update
          if (product.colors[colorIndex].quantity >= item.quantity) {
            console.log(
              `Updating product ID: ${product._id}, Color: ${item.color}, Decreasing quantity by: ${item.quantity}`
            );
            product.colors[colorIndex].quantity -= item.quantity;
          } else {
            throw new Error(
              `Insufficient quantity for color ${item.color.name}`
            );
          }
        }

        // Save the updated product document
        await product.save();
        // console.log("Product updated successfully:", product);
      }
    }

    res.json({
      success: true,
      redirect_url: payuUrl,
      formData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error processing payment and updating quantities",
      error,
    });
  }
});

router.post("/success", async (req, res) => {
  try {
    // Extract txnid from query parameters
    const txnid = req.query.txnid;
    console.log(txnid);

    if (!txnid) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction ID is missing" });
    }

    // Find the order by txnid and update its status to "Payment success"
    const order = await Order.findOneAndUpdate(
      { txnid: txnid },
      { status: "Payment success" },
      { new: true } // Returns the updated document
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Redirect to the success page after updating the order status
    return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch (error) {
    console.error("Error updating order status after payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status after payment",
      error: error.message,
    });
  }
});

// Failure route for payment
router.post("/failure", async (req, res) => {
  try {
    // Extract txnid from query parameters
    const txnid = req.query.txnid;
    console.log(txnid);

    if (!txnid) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction ID is missing" });
    }

    // Find the order by txnid and update its status to "Payment success"
    const order = await Order.findOneAndUpdate(
      { txnid: txnid },
      { status: "Payment failed" },
      { new: true } // Returns the updated document
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Redirect to the success page after updating the order status
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  } catch (error) {
    console.error("Error updating order status after payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status after payment",
      error: error.message,
    });
  }
});

export default router;
