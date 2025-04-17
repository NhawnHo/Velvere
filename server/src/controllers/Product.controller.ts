import { Request, Response } from 'express';
import Product from '../models/Product.model'; // Đảm bảo đúng tên

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', err });
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const user = await Product.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy san pham' });
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', err });
    }
};
