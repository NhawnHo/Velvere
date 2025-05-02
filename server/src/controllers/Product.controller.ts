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
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', err });
    }
};

// Hàm cập nhật số lượng sản phẩm trong kho sau khi đặt hàng
export const updateProductStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { productId, size, color, quantity } = req.body;
        
        if (!productId || !size || !color || !quantity) {
            res.status(400).json({ 
                message: 'Thiếu thông tin cần thiết: productId, size, color, quantity' 
            });
            return;
        }

        // Tìm sản phẩm để cập nhật
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }

        // Tìm variant phù hợp
        const variantIndex = product.variants.findIndex(
            variant => variant.size === size && variant.color === color
        );

        if (variantIndex === -1) {
            res.status(404).json({ 
                message: 'Không tìm thấy biến thể của sản phẩm với size và color đã chọn' 
            });
            return;
        }

        // Kiểm tra nếu kho còn đủ hàng
        if (product.variants[variantIndex].stock < quantity) {
            res.status(400).json({ 
                message: 'Số lượng trong kho không đủ', 
                available: product.variants[variantIndex].stock 
            });
            return;
        }

        // Cập nhật số lượng trong kho
        product.variants[variantIndex].stock -= quantity;

        // Lưu thay đổi vào database
        await product.save();

        res.status(200).json({ 
            message: 'Cập nhật số lượng sản phẩm thành công',
            updatedStock: product.variants[variantIndex].stock 
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật số lượng sản phẩm:', err);
        res.status(500).json({ 
            message: 'Lỗi server khi cập nhật số lượng sản phẩm', 
            error: err 
        });
    }
};

// Hàm cập nhật số lượng cho nhiều sản phẩm cùng lúc (dùng cho đặt hàng nhiều sản phẩm)
export const updateMultipleProductsStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { items } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ 
                message: 'Danh sách sản phẩm không hợp lệ' 
            });
            return;
        }

        const updateResults = [];
        let hasError = false;

        // Duyệt qua từng sản phẩm và cập nhật số lượng
        for (const item of items) {
            const { productId, size, color, quantity } = item;
            
            if (!productId || !size || !color || !quantity) {
                updateResults.push({
                    productId,
                    success: false,
                    message: 'Thiếu thông tin sản phẩm'
                });
                hasError = true;
                continue;
            }

            try {
                // Tìm sản phẩm để cập nhật
                const product = await Product.findById(productId);
                if (!product) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: 'Không tìm thấy sản phẩm'
                    });
                    hasError = true;
                    continue;
                }

                // Tìm variant phù hợp
                const variantIndex = product.variants.findIndex(
                    variant => variant.size === size && variant.color === color
                );

                if (variantIndex === -1) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: 'Không tìm thấy biến thể sản phẩm'
                    });
                    hasError = true;
                    continue;
                }

                // Kiểm tra nếu kho còn đủ hàng
                if (product.variants[variantIndex].stock < quantity) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: 'Số lượng trong kho không đủ',
                        available: product.variants[variantIndex].stock
                    });
                    hasError = true;
                    continue;
                }

                // Cập nhật số lượng trong kho
                product.variants[variantIndex].stock -= quantity;

                // Lưu thay đổi vào database
                await product.save();

                updateResults.push({
                    productId,
                    success: true,
                    updatedStock: product.variants[variantIndex].stock
                });
            } catch (err) {
                updateResults.push({
                    productId,
                    success: false,
                    message: 'Lỗi khi cập nhật sản phẩm',
                    error: err
                });
                hasError = true;
            }
        }

        if (hasError) {
            res.status(207).json({
                message: 'Một số sản phẩm không thể cập nhật',
                results: updateResults
            });
        } else {
            res.status(200).json({
                message: 'Cập nhật số lượng tất cả sản phẩm thành công',
                results: updateResults
            });
        }
    } catch (err) {
        console.error('Lỗi khi cập nhật số lượng nhiều sản phẩm:', err);
        res.status(500).json({ 
            message: 'Lỗi server khi cập nhật số lượng sản phẩm', 
            error: err 
        });
    }
};
