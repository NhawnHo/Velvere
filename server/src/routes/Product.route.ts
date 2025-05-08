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

router.get('/', getAllProducts);
router.post('/', addProduct);
router.get('/best-selling', getBestSellingProduct);
router.get('/:id', getProductById); // Thêm dòng này để xử lý lấy 1 sản phẩm theo ID
router.put('/:id', updateProduct);
router.put('/update-stock', updateProductStock); // Cập nhật số lượng sản phẩm đơn lẻ
router.put('/update-multiple-stock', updateMultipleProductsStock); // Cập nhật số lượng nhiều sản phẩm
export default router;
