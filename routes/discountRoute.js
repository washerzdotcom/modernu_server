import express from "express";
import Discount from "../models/discountModel.js";

const router = express.Router();

// Admin creates discount codes
router.post("/create", async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate } = req.body;

    // Check if discount code already exists
    const existingDiscount = await Discount.findOne({ code });
    if (existingDiscount) {
      return res.status(400).json({ error: "Discount code already exists" });
    }

    const discount = new Discount({
      code,
      discountPercentage,
      expiryDate,
    });

    await discount.save();
    res.status(201).json({ success: true, discount });
  } catch (error) {
    res.status(500).json({ error: "Error creating discount code" });
  }
});

// Route to apply discount
router.post("/apply", async (req, res) => {
  try {
    const { code } = req.body;

    const discount = await Discount.findOne({ code, isActive: true });
    if (!discount) {
      return res
        .status(404)
        .json({ error: "Invalid or expired discount code" });
    }

    const currentDate = new Date();
    if (currentDate > new Date(discount.expiryDate)) {
      return res.status(400).json({ error: "Discount code has expired" });
    }

    res.status(200).json({
      success: true,
      discountPercentage: discount.discountPercentage,
    });
  } catch (error) {
    res.status(500).json({ error: "Error applying discount code" });
  }
});

// Fetch all discounts
router.get("/list", async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json({ success: true, discounts });
  } catch (error) {
    res.status(500).json({ error: "Error fetching discounts" });
  }
});

// Update a discount
router.put("/update/:code", async (req, res) => {
  try {
    console.log("Request params:", req.params.code);
    console.log("Request body:", req.body);

    const { discountPercentage, expiryDate } = req.body;
    const discount = await Discount.findOneAndUpdate(
      { code: req.params.code },
      { discountPercentage, expiryDate },
      { new: true }
    );

    if (!discount) {
      return res.status(404).json({ error: "Discount not found" });
    }
    res.json({ success: true, discount });
  } catch (error) {
    console.error("Error in updating discount:", error);
    res.status(500).json({ error: "Error updating discount" });
  }
});

export default router;
