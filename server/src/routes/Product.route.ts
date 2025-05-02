import express from 'express';
import {
    getAllProducts,
    getProductById,
    updateProductStock,
    updateMultipleProductsStock
} from '../controllers/Product.controller';



const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById); // ✅ Thêm dòng này để xử lý lấy 1 sản phẩm theo ID
router.put('/update-stock', updateProductStock); // Cập nhật số lượng sản phẩm đơn lẻ
router.put('/update-multiple-stock', updateMultipleProductsStock); // Cập nhật số lượng nhiều sản phẩm

export default router;

