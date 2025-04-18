import express from 'express';
import {
    getAllProducts,
    getProductById,
} from '../controllers/Product.controller';



const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id',getProductById); // ✅ Thêm dòng này để xử lý lấy 1 sản phẩm theo ID

export default router;

