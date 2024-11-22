import express from "express";
import { isAdmin, requireSignIn } from "./../middleware/authMiddleware.js";
import {
  createProductController,
  deleteProductController,
  filterProductsByPrice,
  getPorductController,
  getSinglePorductController,
  productCountController,
  productFilltersController,
  productListController,
  productPhotoController,
  productPhotosController,
  relatedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

const router = express.Router();

// routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

// update-product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get products
router.get("/get-product", getPorductController);

//single product
router.get("/get-product/:slug", getSinglePorductController);

// get photo
router.get("/product-photo/:pid", productPhotoController);

// get photo
router.get("/product-photos/:pid", productPhotosController);

// delete product
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFilltersController);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", relatedProductController);

router.post("/price-filters", filterProductsByPrice);

export default router;
