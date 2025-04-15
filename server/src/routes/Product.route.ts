import express from 'express';
import { getAllProducts } from '../controllers/Product.controller';

const router = express.Router();

router.get('/', getAllProducts); // sử dụng controller đã tách

export default router;
