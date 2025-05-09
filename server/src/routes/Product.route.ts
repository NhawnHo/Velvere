import express from 'express';
import {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductStock,
    updateMultipleProductsStock,
    getBestSellingProduct,
    updateVariantStock,
} from '../controllers/Product.controller';

const router = express.Router();

// Get all products
router.get('/', getAllProducts);

// Get best-selling products
router.get('/best-selling', getBestSellingProduct);

// Get product by ID
router.get('/:id', getProductById);

// Add a new product
router.post('/', addProduct);

// Update an existing product
router.put('/:id', updateProduct);

// Update variant stock
router.put('/update-variant-stock', updateVariantStock);

// Update stock for a single product
router.put('/update-stock', updateProductStock);

// Update stock for multiple products
router.put('/update-multiple-stock', updateMultipleProductsStock);

export default router;
