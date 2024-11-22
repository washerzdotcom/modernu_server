import productModel from "../models/productModel.js";
import fs from "fs";
import slugify from "slugify";

export const createProductController = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      oldprice,
      category,
      shipping,
      colors, // Handle colors
    } = req.fields;

    const { productType } = req.query;

    const photos = req.files; // Multiple photos will be available here

    // Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !oldprice:
        return res.status(500).send({ error: "Old price is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !photos || Object.keys(photos).length === 0:
        return res
          .status(500)
          .send({ error: "At least one photo is required" });
      case Object.values(photos).some((photo) => photo.size > 1000000):
        return res
          .status(500)
          .send({ error: "All photos should be less than 1MB" });
    }
    // Parse colors to JSON if received as a string
    const parsedColors =
      typeof colors === "string" ? JSON.parse(colors) : colors;

    const product = new productModel({
      ...req.fields,
      productType,
      slug: slugify(name),
      colors: parsedColors, // Store colors
    });

    // Save multiple photos
    if (photos && Object.keys(photos).length > 0) {
      Object.values(photos).forEach((photo, index) => {
        product.photos.push({
          data: fs.readFileSync(photo.path),
          contentType: photo.type,
        });
      });
    }

    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.error("Error in creating product:", error); // Log the full error
    res.status(500).send({
      success: false,
      error, // Send the full error object for more context
      message: "Error in creating product",
    });
  }
};

// get all product

export const getPorductController = async (req, res) => {
  try {
    const { productType } = req.query;
    const products = await productModel
      .find({ productType: productType })
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      totalCount: products.length,
      message: "All products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error while getting all product",
    });
  }
};

//get single product
export const getSinglePorductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      message: "Single product fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while single getting product",
      error,
    });
  }
};

// get photo
// export const porductPhotoController = async (req, res) => {
//   try {
//     const product = await productModel.findById(req.params.pid).select("photo");
//     if (product.photos.data) {
//       res.set("Content-type", product.photo.contentType);
//       return res.status(200).send(product.photo.data);
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error while getting photo",
//       error,
//     });
//   }
// };
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.pid)
      .select("photos"); // Fetch photos

    // Check if product has any photos
    if (!product || product.photos.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No photos found for this product",
      });
    }

    // Select the first photo for simplicity (or any specific index)
    const photoIndex = req.params.index || 0; // Optionally, pass the photo index in params
    const photo = product.photos[photoIndex]; // Get the photo at the specified index

    if (photo && photo.data) {
      // Set the correct content type for the photo
      res.set("Content-Type", photo.contentType);
      // Send the binary data
      return res.status(200).send(photo.data);
    } else {
      return res.status(404).send({
        success: false,
        message: "Photo not found or no data available",
      });
    }
  } catch (error) {
    console.error("Error while getting photo:", error); // Log error for debugging
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};
export const productPhotosController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.pid)
      .select("photos"); // Fetch photos

    // Check if product has any photos
    if (!product || product.photos.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No photos found for this product",
      });
    }

    // Send all photos as base64 encoded
    const photos = product.photos.map((photo) => {
      return {
        contentType: photo.contentType,
        data: photo.data.toString("base64"), // Convert binary data to base64 string
      };
    });

    return res.status(200).send({
      success: true,
      message: "Photos retrieved successfully",
      photos,
    });
  } catch (error) {
    console.error("Error while getting photos:", error); // Log error for debugging
    res.status(500).send({
      success: false,
      message: "Error while getting photos",
      error,
    });
  }
};

// delete product
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete product",
      error,
    });
  }
};

//update product

// export const updateProductController = async (req, res) => {
//   try {
//     const {
//       name,
//       slug,
//       description,
//       price,
//       oldprice,
//       category,
//       quantity,
//       Shipping,
//     } = req.fields;
//     const { photo } = req.files;
//     console.log(photo);
//     //validation
//     switch (true) {
//       case !name:
//         return res.status(500).send({ error: "Name is Required" });
//       case !description:
//         return res.status(500).send({ error: "Description is Required" });
//       case !price:
//         return res.status(500).send({ error: "Price is Required" });
//       case !oldprice:
//         return res.status(500).send({ error: "Oldprice is Required" });
//       case !category:
//         return res.status(500).send({ error: "Category is Required" });
//       case !quantity:
//         return res.status(500).send({ error: "Quantity is Required" });
//       case photo && photo.size > 1000000:
//         return res
//           .status(500)
//           .send({ error: "Photo is Required and should be less then 1mb" });
//     }
//     const products = await productModel.findByIdAndUpdate(
//       req.params.pid,
//       { ...req.fields, slug: slugify(name) },
//       { new: true }
//     );
//     if (photo) {
//       products.photos.data = fs.readFileSync(photo.path);
//       products.photos.contentType = photo.type;
//     }
//     await products.save();
//     res.status(201).send({
//       success: true,
//       message: "Product update Successfully",
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       error,
//       message: "Error in update product",
//     });
//   }
// };
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      oldprice,
      category,
      quantity,
      Shipping,
      colors, // Added to handle colors
    } = req.fields;
    const { photo } = req.files;

    // Validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !oldprice:
        return res.status(500).send({ error: "Oldprice is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Photo is Required and should be less then 1mb" });
    }

    // Updating product data including colors
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, colors: JSON.parse(colors), slug: slugify(name) },
      { new: true }
    );

    if (photo) {
      products.photos.data = fs.readFileSync(photo.path);
      products.photos.contentType = photo.type;
    }
    await products.save();

    res.status(201).send({
      success: true,
      message: "Product updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in update product",
    });
  }
};

//Filter product

// export const productFilltersController = async (req, res) => {
//   try {
//     const { checked, priceRange } = req.body;
//     let args = {};
//     if (checked.length > 0) args.category = checked;
//     if (priceRange.length)
//       args.price = { $gte: priceRange[0], $lte: priceRange[1] };

//     const products = await productModel.find(args);
//     res.status(200).send({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({
//       success: false,
//       message: "Error While Filter Products",
//       error,
//     });
//   }
// };

export const productFilltersController = async (req, res) => {
  try {
    const { checked, priceRange } = req.body;
    const { productType } = req.query;

    let args = {};

    // Filter by product type if provided
    if (productType) {
      args.productType = productType; // Assuming products have a field called 'productType'
    }

    // Filter by category if provided (assuming checked contains category _id)
    if (checked.length > 0) {
      args.category = { $in: checked }; // Directly use _id from frontend
    }

    // Filter by price range if provided
    if (priceRange.length) {
      args.price = { $gte: priceRange[0], $lte: priceRange[1] };
    }

    // Find products based on the filters
    const products = await productModel.find(args);

    // Send the filtered products
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Filtering Products",
      error,
    });
  }
};

//product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in product count",
      error,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 4;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error,
    });
  }
};

//search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in search product API",
      error,
    });
  }
};

//related product
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(4)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related product.",
      error,
    });
  }
};

// controllers/productController.js

export const filterProductsByPrice = async (req, res) => {
  try {
    const { priceRange } = req.body;
    const minPrice = priceRange[0];
    const maxPrice = priceRange[1];

    // Fetch products within the price range
    const products = await productModel.find({
      price: { $gte: minPrice, $lte: maxPrice },
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error filtering products by price",
    });
  }
};
