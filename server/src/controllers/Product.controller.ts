import { Request, Response } from 'express';
import Product from '../models/Product.model'; // Đảm bảo đúng tên
import mongoose from 'mongoose'; // Import mongoose để kiểm tra ObjectId

// Định nghĩa interface cho variant
interface Variant {
    size: string;
    color: string;
    stock: number;
}

// Định nghĩa interface cho Product model (cần có variants)
interface ProductDocument extends mongoose.Document {
    product_name: string;
    description: string;
    category_id: mongoose.Types.ObjectId; // Giả định category_id là ObjectId
    sex: string;
    images: string[];
    price: number;
    xuatXu: string;
    chatLieu: string;
    variants: Variant[];
    // Thêm các trường khác nếu có trong Product model
}

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error('Lỗi server khi lấy sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', err });
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        // Kiểm tra tính hợp lệ của ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        res.status(200).json(product);
    } catch (err) {
        console.error('Lỗi server khi lấy sản phẩm theo ID:', err);
        res.status(500).json({ message: 'Lỗi server', err });
    }
};

// Hàm cập nhật số lượng sản phẩm trong kho sau khi đặt hàng (cho một sản phẩm)
// Lưu ý: Hàm này có vẻ không được sử dụng trong luồng đặt hàng nhiều sản phẩm
export const updateProductStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { productId, size, color, quantity } = req.body;
        if (
            !productId ||
            !size ||
            !color ||
            quantity === undefined ||
            quantity === null
        ) {
            // Kiểm tra quantity rõ ràng
            res.status(400).json({
                message:
                    'Thiếu thông tin cần thiết: productId, size, color, quantity',
            });
            return;
        }

        // Kiểm tra tính hợp lệ của productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        } // Tìm sản phẩm để cập nhật

        const product = (await Product.findById(
            productId,
        )) as ProductDocument | null; // Cast to ProductDocument
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        } // Tìm variant phù hợp

        const variantIndex = product.variants.findIndex(
            (variant) => variant.size === size && variant.color === color,
        );

        if (variantIndex === -1) {
            res.status(404).json({
                message:
                    'Không tìm thấy biến thể của sản phẩm với size và color đã chọn',
            });
            return;
        } // Kiểm tra nếu kho còn đủ hàng (chỉ khi quantity > 0, tức là trừ đi)

        if (quantity > 0 && product.variants[variantIndex].stock < quantity) {
            res.status(400).json({
                message: 'Số lượng trong kho không đủ',
                available: product.variants[variantIndex].stock,
            });
            return;
        } // Cập nhật số lượng trong kho (trừ đi nếu quantity > 0, cộng lại nếu quantity < 0)

        product.variants[variantIndex].stock -= quantity; // Lưu thay đổi vào database

        await product.save();

        res.status(200).json({
            message: 'Cập nhật số lượng sản phẩm thành công',
            updatedStock: product.variants[variantIndex].stock,
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật số lượng sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật số lượng sản phẩm',
            error: err,
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
                message: 'Danh sách sản phẩm không hợp lệ',
            });
            return;
        }

        const updateResults = [];
        let hasError = false; // Duyệt qua từng sản phẩm và cập nhật số lượng

        for (const item of items) {
            const { productId, size, color, quantity } = item; // Kiểm tra thông tin cần thiết cho từng item
            if (
                !productId ||
                !size ||
                !color ||
                quantity === undefined ||
                quantity === null
            ) {
                updateResults.push({
                    productId: productId || 'unknown', // Ghi log productId nếu có
                    success: false,
                    message:
                        'Thiếu thông tin cần thiết cho sản phẩm trong danh sách',
                });
                hasError = true;
                continue;
            }

            // Kiểm tra tính hợp lệ của productId
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                updateResults.push({
                    productId: productId,
                    success: false,
                    message: 'ID sản phẩm không hợp lệ',
                });
                hasError = true;
                continue;
            }

            try {
                // Tìm sản phẩm để cập nhật
                const product = (await Product.findById(
                    productId,
                )) as ProductDocument | null; // Cast to ProductDocument
                if (!product) {
                    updateResults.push({
                        productId: productId,
                        success: false,
                        message: 'Không tìm thấy sản phẩm',
                    });
                    hasError = true;
                    continue;
                } // Tìm variant phù hợp

                const variantIndex = product.variants.findIndex(
                    (variant) =>
                        variant.size === size && variant.color === color,
                );

                if (variantIndex === -1) {
                    updateResults.push({
                        productId: productId,
                        success: false,
                        message:
                            'Không tìm thấy biến thể sản phẩm với size và color đã chọn',
                    });
                    hasError = true;
                    continue;
                } // Kiểm tra nếu kho còn đủ hàng (chỉ khi quantity > 0, tức là trừ đi)

                if (
                    quantity > 0 &&
                    product.variants[variantIndex].stock < quantity
                ) {
                    updateResults.push({
                        productId: productId,
                        success: false,
                        message: `Số lượng trong kho không đủ (${product.variants[variantIndex].stock} có sẵn)`,
                        available: product.variants[variantIndex].stock,
                    });
                    hasError = true;
                    continue;
                } // Cập nhật số lượng trong kho (trừ đi nếu quantity > 0, cộng lại nếu quantity < 0)

                product.variants[variantIndex].stock -= quantity; // Lưu thay đổi vào database

                await product.save();

                updateResults.push({
                    productId: productId,
                    success: true,
                    updatedStock: product.variants[variantIndex].stock,
                });
            } catch (err) {
                console.error(
                    `Lỗi khi cập nhật sản phẩm ${item.productId}:`,
                    err,
                );
                updateResults.push({
                    productId: productId,
                    success: false,
                    message: 'Lỗi server khi xử lý sản phẩm',
                    error: (err as Error).message, // Trích xuất message từ error
                });
                hasError = true;
            }
        } // Trả về trạng thái 207 nếu có lỗi xảy ra với ít nhất một sản phẩm

        if (hasError) {
            res.status(207).json({
                // Multi-Status
                message:
                    'Đã xử lý yêu cầu, nhưng có lỗi xảy ra với một số sản phẩm',
                results: updateResults,
            });
        } else {
            res.status(200).json({
                message: 'Cập nhật số lượng tất cả sản phẩm thành công',
                results: updateResults,
            });
        }
    } catch (err) {
        console.error('Lỗi server khi cập nhật số lượng nhiều sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi xử lý yêu cầu cập nhật số lượng', // Thông báo lỗi chung
            error: (err as Error).message, // Trích xuất message từ error
        });
    }
};
