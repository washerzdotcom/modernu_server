import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import discoutnRoutes from "./routes/discountRoute.js";

//configure env
dotenv.config();

//database config
connectDB();

//rest object
const app = express();

//middelwares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/discount", discoutnRoutes);

//rest api
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to ModernU",
  });
});

//PORT
const PORT = process.env.PORT || 8080;

// run Listen
app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on ${process.env.DEV_MODE} mode on port ${PORT}`);
});

// import express from "express";
// import dotenv from "dotenv";
// import morgan from "morgan";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoute.js";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import cors from "cors";
// import productRoutes from "./routes/productRoutes.js";
// import kidcategoryRoute from "./routes/kidcategoryRoute.js";
// import kidProductRoutes from "./routes/kidProductRoutes.js";
// import winston from "winston";

// // configure environment variables
// dotenv.config();

// // database config
// connectDB();

// // rest object
// const app = express();

// // Logger setup using winston
// const logger = winston.createLogger({
//   level: "error",
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({ filename: "error.log" }), // Log errors to a file
//     new winston.transports.Console(), // Log errors to console as well
//   ],
// });

// // Middleware to log errors
// app.use((err, req, res, next) => {
//   logger.error({
//     message: err.message,
//     stack: err.stack,
//     url: req.originalUrl,
//   });
//   res.status(500).send("Internal Server Error");
// });

// // Enable CORS for frontend URL (https://phase.modernu.in)
// app.use(
//   cors({
//     origin: "https://phase.modernu.in", // Allow requests from this frontend
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Middlewares
// app.use(express.json());
// app.use(morgan("dev"));

// // Routes
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/category", categoryRoutes);
// app.use("/api/v1/product", productRoutes);
// app.use("/api/v1/kid-category", kidcategoryRoute);
// app.use("/api/v1/kid-product", kidProductRoutes);

// // Base route
// app.get("/", (req, res) => {
//   res.send({
//     message: "Welcome to ModernU",
//   });
// });

// // PORT
// const PORT = process.env.PORT || 8080;

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.DEV_MODE} mode on port ${PORT}`);
// });
