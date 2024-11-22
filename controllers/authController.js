import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import otpGenerator from "otp-generator";
import Twilio from "twilio";
import otpModel from "../models/otpModel.js";
import bcrypt from "bcrypt";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, phone, password, address, pincode } = req.body;
    //validations
    if (!name) {
      return res.send({ message: "Name is Required" });
    }
    if (!phone) {
      return res.send({ message: "phone is Required" });
    }
    if (!password) {
      return res.send({ message: "password is Required" });
    }
    if (!address) {
      return res.send({ message: "address is Required" });
    }
    if (!pincode) {
      return res.send({ message: "pincode is Required" });
    }

    //check user
    const exisitingUser = await userModel.findOne({ phone });
    //existing user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register Please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      phone,
      address,
      password: hashedPassword,
      pincode,
    }).save();
    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
};

//send otp WhatsApps
export const sendOtpWhatsAppController = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_ACCOUNT_TOKEN;
    const twilioClient = new Twilio(accountSid, authToken);

    const { phone } = req.body;
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const currentDate = new Date();

    await otpModel.findOneAndUpdate(
      { phone },
      { otp, otpExpiration: new Date(currentDate.getTime()) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await twilioClient.messages.create({
      body: `Your OTP is : ${otp}`,
      to: `whatsapp:+91${phone}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    });

    res.status(200).send({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in send OTP",
      error,
    });
  }
};

//send otp sms
export const sendOtpSMSController = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_ACCOUNT_TOKEN;
    const twilioClient = new Twilio(accountSid, authToken);

    const { phone } = req.body;
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const currentDate = new Date();

    await otpModel.findOneAndUpdate(
      { phone },
      { otp, otpExpiration: new Date(currentDate.getTime()) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await twilioClient.messages.create({
      body: `Your OTP is : ${otp}`,
      to: `+91${phone}`,
      from: `${process.env.TWILIO_PHONE_NUMBER}`,
    });

    res.status(200).send({
      success: true,
      message: "OTP Sent Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in send OTP",
      error,
    });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate the input
    if (!phone || !otp) {
      return res.status(400).send({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // Fetch the stored OTP from the database
    const otpRecord = await otpModel.findOne({ phone });

    // Check if OTP record exists
    if (!otpRecord) {
      return res.status(404).send({
        success: false,
        message: "OTP not found for this phone number",
      });
    }

    // Check if the OTP is correct and not expired
    const isOtpValid = otpRecord.otp === otp;
    if (!isOtpValid) {
      return res.status(400).send({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Optionally, you can check if the OTP is expired here
    // If you saved the expiration time, add this check:
    // const currentTime = new Date();
    // if (otpRecord.otpExpiration && currentTime > otpRecord.otpExpiration) {
    //   return res.status(400).send({
    //     success: false,
    //     message: "OTP has expired",
    //   });
    // }

    // After successful OTP verification, delete the OTP record (optional)
    await otpModel.deleteOne({ phone });

    // Mark the user as verified in the User model (if applicable)
    const user = await userModel.findOne({ phone });
    if (user) {
      user.isVerified = true; // Assuming you have an `isVerified` field in your User model
      await user.save();
    }

    return res.status(200).send({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log("Error verifying OTP:", error);
    return res.status(500).send({
      success: false,
      message: "Error in verifying OTP",
      error,
    });
  }
};

//change password
export const changePasswordController = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate the input
    if (!phone || !password) {
      return res.status(400).send({
        success: false,
        message: "Phone number and password are required",
      });
    }

    // Fetch the user based on the phone number
    const user = await userModel.findOne({ phone });

    // Check if user exists
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Error changing password:", error);
    return res.status(500).send({
      success: false,
      message: "Error in changing password",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { phone, password } = req.body;
    //validation
    if (!phone || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid Phone Number or password",
      });
    }
    //check user
    const user = await userModel.findOne({ phone });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "phone is not registerd",
        error,
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, phone, address, pincode } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Password is required and 6 character long" });
    }
    //pincode
    if (pincode && pincode.length < 6) {
      return res.json({ error: "Enter a 6 digit pincode" });
    }
    if (pincode.length < 6) {
      return res.json({ error: "pincode is 6 character only" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
        pincode: pincode || user.pincode,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while update profile",
      error,
    });
  }
};

//order replace
export const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, totalAmount, address, city, state, pin } =
      req.body;

    // Basic validation
    if (
      !userId ||
      !cartItems ||
      !totalAmount ||
      !address ||
      !city ||
      !state ||
      !pin
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Map cart items to the required structure
    const products = cartItems.map((item) => ({
      product: item._id, // Ensure _id is being used here
      quantity: item.quantity || 1, // Use quantity if available, otherwise default to 1
      price: item.price,
    }));

    // Create new order
    const newOrder = new orderModel({
      user: req.user._id, // Replace with an actual user ID
      products,
      totalAmount,
      address,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ success: true, message: "Order created successfully" });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message, // Ensure this is included for debugging
    });
  }
};

export const getOrderController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id }) // Changed 'buyer' to 'user'
      .populate({
        path: "products.product", // Populate the product details
        select: "-photo", // Exclude the photo field
      })
      .populate({
        path: "user", // Populate the user details (previously buyer)
        select: "name", // Select only the name field
      });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

export const getOrderByIdController = async (req, res) => {
  try {
    const orderId = req.params.orderId; // Get the orderId from the request parameters

    // Find the order by ID, populate necessary fields
    const order = await orderModel
      .findById(orderId) // Find the order by ID
      .populate({
        path: "products.product", // Populate the product details
        select: "-photos", // Exclude the photo field
      })
      .populate({
        path: "user", // Populate the user details
        select: "name", // Select only the name field
      });

    // If the order is not found, return a 404 response
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Return the found order
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting order",
      error,
    });
  }
};

export const getAllOrderController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate({
        path: "products.product", // Populate the product details
        select: "-photo", // Exclude the photo field
      })
      .populate({
        path: "user", // Populate the user details (previously buyer)
        select: "name", // Select only the name field
      });

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting all orders in admin dashboard",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(orderId, { status });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while Updating order status",
      error,
    });
  }
};

// Create new admin
export const createNewAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if phone or email already exists
    const existingUser = await userModel.findOne({
      $or: [{ phone }, { email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this phone or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with role as admin
    const newUser = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 1, // 1 for admin role
    });

    await newUser.save();
    res.status(201).json({ message: "New admin created successfully" });
  } catch (error) {
    console.error("Error creating new admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all admins
export const getAllAdmin = async (req, res) => {
  try {
    const admins = await userModel.find({ role: 1 }, "name email phone"); // Select only necessary fields
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error" });
  }
};
