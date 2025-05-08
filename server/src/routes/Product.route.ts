import express from 'express';
import {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductStock,
    updateMultipleProductsStock,
    getBestSellingProduct,
} from '../controllers/Product.controller';

const router = express.Router();

// Get all products
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Add a new product
router.post('/', addProduct);

// Update an existing product
router.put('/:id', updateProduct);

// Update stock for a single product
router.post('/update-stock', updateProductStock);

// Update stock for multiple products
router.post('/update-multiple-stock', updateMultipleProductsStock);

// Get best-selling products
router.get('/stats/best-selling', getBestSellingProduct);

export default router;
