import express from 'express';
import { isAdmin, requireSignIn } from './../middleware/authMiddleware.js';
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from '../controllers/categoryController.js';

const router = express.Router() 

//routes
//create category
router.post('/create-category',
    requireSignIn,
    isAdmin,
    createCategoryController
);

//update category
router.put(
    "/update-category/:id",
    requireSignIn,
    isAdmin,
    updateCategoryController
);

//getAll category
router.get(
    '/get-category',
    categoryController
);

// get single category
router.get(
    '/single-category/:slug',
    singleCategoryController
)

// Delete Category
router.delete(
    '/delete-category/:id',
    requireSignIn,
    isAdmin,
    deleteCategoryController
)

export default router; 