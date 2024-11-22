import express from "express";
import {
  registerController,
  loginController,
  testController,
  updateProfileController,
  createOrder,
  getOrderController,
  getAllOrderController,
  orderStatusController,
  verifyOtpController,
  changePasswordController,
  sendOtpSMSController,
  sendOtpWhatsAppController,
  getOrderByIdController,
  createNewAdmin,
  getAllAdmin,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js";

//router object
const router = express.Router();

//routing
//REGISTER || method post
router.post("/register", registerController);

//send otp via sms
router.post("/send-otp-sms", sendOtpSMSController);

//send otp via WhatsApp
router.post("/send-otp-whatsapp", sendOtpWhatsAppController);

//verify otp
router.post("/verify-otp", verifyOtpController);

//forget password
router.post("/change-password", changePasswordController);

//LOGIN || POST
router.post("/login", loginController);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protectec user route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protectec Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

//order replace
router.post("/create-order", requireSignIn, createOrder);

//get orders
router.get("/orders", requireSignIn, getOrderController);

router.get("/order/:orderId", requireSignIn, getOrderByIdController);

//all get orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrderController);

//order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);
router.post("/create-admin", requireSignIn, isAdmin, createNewAdmin);
router.get("/get-admins", requireSignIn, isAdmin, getAllAdmin);

export default router;
