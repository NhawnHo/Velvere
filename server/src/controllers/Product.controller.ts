import { Request, Response } from 'express';
import Product from '../models/Product.model';

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', err });
    }
};
